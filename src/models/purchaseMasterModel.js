const getFinancialYear = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const y1 = month >= 4 ? year : year - 1;
  return `${String(y1).slice(-2)}-${String(y1 + 1).slice(-2)}`;
};

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

export const getAllPurchaseOrders = (db) =>
  db.purchaseMaster.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      supplier: { select: { id: true, supplierName: true, sCode: true } },
      details: { orderBy: { slNo: 'asc' } },
    },
  });

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
        supplier: { select: { id: true, supplierName: true, sCode: true } },
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
        supplier: { select: { id: true, supplierName: true, sCode: true } },
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
