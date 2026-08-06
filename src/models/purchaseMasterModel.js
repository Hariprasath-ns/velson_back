import { getFinancialYear } from "../utils/date.js";

export const getNextPoNo = async (db) => {
  const fy = getFinancialYear();
  const pattern = `${fy}/PO%`;
  const rows = await db.$queryRaw`
    SELECT "poNo" FROM purchase_master
    WHERE "poNo" LIKE ${pattern}
    ORDER BY "poNo" DESC
    LIMIT 1
  `;
  if (rows.length > 0) {
    const prefix = `${fy}/PO`;
    const seq = parseInt(rows[0].poNo.replace(prefix, ''), 10);
    return { poNo: `${prefix}${String(seq + 1).padStart(5, '0')}`, financialYear: fy };
  }
  return { poNo: `${fy}/PO00001`, financialYear: fy };
};

export const getAllPurchaseOrders = async (db, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    db.purchaseMaster.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: {
          select: {
            id: true,
            sCode: true,
            supplierName: true,
            supplierType: true,
            address: true,
            address2: true,
            address3: true,
            address4: true,
            city: true,
            state: true,
            stateCode: true,
            country: true,
            pinCode: true,
            contactPerson: true,
            mobile: true,
            mobileCode: true,
            phone: true,
            phoneCode: true,
            email: true,
            website: true,
            gstNo: true,
            panNo: true,
            bankName: true,
            branchName: true,
            accountName: true,
            accountNumber: true,
            ifscCode: true,
            micrCode: true,
          },
        },
        details: { orderBy: { slNo: 'asc' } },
      },
    }),
    db.purchaseMaster.count()
  ]);
  return { data, total, page, limit };
};

export const getPurchaseOrderById = async (db, id) => {
  const po = await db.purchaseMaster.findUnique({
    where: { id },
    include: {
      supplier: true,
      details: { orderBy: { slNo: 'asc' } },
    },
  });
  if (!po) return null;
  const pr = await db.purchaseRequest.findFirst({
    where: { poNo: po.poNo },
    select: { prNo: true },
  });
  return { ...po, prNo: pr?.prNo || null };
};

const TX_OPTS = { maxWait: 10000, timeout: 20000 };

export const createPurchaseOrder = (db, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    const master = await tx.purchaseMaster.create({ data: headerData });
    if (detailRows.length > 0) {
      await tx.purchaseDetail.createMany({
        data: detailRows.map((r, i) => ({ ...r, poId: master.id, slNo: i + 1 })),
      });
    }
    return tx.purchaseMaster.findUnique({
      where: { id: master.id },
      include: {
        supplier: {
          select: {
            id: true,
            sCode: true,
            supplierName: true,
            supplierType: true,
            address: true,
            address2: true,
            address3: true,
            address4: true,
            city: true,
            state: true,
            stateCode: true,
            country: true,
            pinCode: true,
            contactPerson: true,
            mobile: true,
            mobileCode: true,
            phone: true,
            phoneCode: true,
            email: true,
            website: true,
            gstNo: true,
            panNo: true,
            bankName: true,
            branchName: true,
            accountName: true,
            accountNumber: true,
            ifscCode: true,
            micrCode: true,
          },
        },
        details: { orderBy: { slNo: 'asc' } },
      },
    });
  }, TX_OPTS);

export const updatePurchaseOrder = (db, id, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    await tx.purchaseDetail.deleteMany({ where: { poId: id } });
    await tx.purchaseMaster.update({ where: { id }, data: headerData });
    if (detailRows.length > 0) {
      await tx.purchaseDetail.createMany({
        data: detailRows.map((r, i) => ({ ...r, poId: id, slNo: i + 1 })),
      });
    }
    return tx.purchaseMaster.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            sCode: true,
            supplierName: true,
            supplierType: true,
            address: true,
            address2: true,
            address3: true,
            address4: true,
            city: true,
            state: true,
            stateCode: true,
            country: true,
            pinCode: true,
            contactPerson: true,
            mobile: true,
            mobileCode: true,
            phone: true,
            phoneCode: true,
            email: true,
            website: true,
            gstNo: true,
            panNo: true,
            bankName: true,
            branchName: true,
            accountName: true,
            accountNumber: true,
            ifscCode: true,
            micrCode: true,
          },
        },
        details: { orderBy: { slNo: 'asc' } },
      },
    });
  }, TX_OPTS);

export const deletePurchaseOrder = (db, id) =>
  db.purchaseMaster.delete({ where: { id } });

export const getDistinctPOFieldValues = async (db) => {
  const textFields = ['destination', 'paymentTerms', 'testReport', 'project', 'modeOfDespatch']
  const result = {}
  await Promise.all(
    textFields.map(async (field) => {
      const rows = await db.purchaseMaster.findMany({
        distinct: [field],
        where: { [field]: { not: null } },
        select: { [field]: true },
        orderBy: { [field]: 'asc' },
      })
      result[field] = rows.map(r => r[field]).filter(v => v && v.trim())
    })
  )
  const freightRows = await db.purchaseMaster.findMany({
    distinct: ['freight'],
    where: { freight: { gt: 0 } },
    select: { freight: true },
    orderBy: { freight: 'asc' },
  })
  result.freight = freightRows.map(r => String(r.freight))
  return result
}
