import { getFinancialYear } from "../utils/date.js";

export const getNextPrNo = async (db) => {
  const fy = getFinancialYear();
  const pattern = `${fy}/PR%`;
  const rows = await db.$queryRaw`
    SELECT "prNo" FROM purchase_request
    WHERE "prNo" LIKE ${pattern}
    ORDER BY "prNo" DESC
    LIMIT 1
  `;
  if (rows.length > 0) {
    const prefix = `${fy}/PR`;
    const seq = parseInt(rows[0].prNo.replace(prefix, ''), 10);
    return { prNo: `${prefix}${String(seq + 1).padStart(5, '0')}`, financialYear: fy };
  }
  return { prNo: `${fy}/PR00001`, financialYear: fy };
};

const PR_INCLUDE = {
  details:          { orderBy: { slNo: 'asc' } },
  departmentRef:    { select: { id: true, code: true, description: true } },
  teamRef:          { select: { id: true, code: true, description: true } },
  requestingForRef: { select: { id: true, code: true, description: true } },
};

export const getAllPurchaseRequests = async (db, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    db.purchaseRequest.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: PR_INCLUDE,
    }),
    db.purchaseRequest.count()
  ]);
  return { data, total, page, limit };
};

export const getPurchaseRequestById = (db, id) =>
  db.purchaseRequest.findUnique({
    where: { id },
    include: PR_INCLUDE,
  });

const TX_OPTS = { maxWait: 10000, timeout: 20000 };

export const createPurchaseRequest = (db, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    const master = await tx.purchaseRequest.create({ data: headerData });
    if (detailRows.length > 0) {
      await tx.purchaseRequestDetail.createMany({
        data: detailRows.map((r, i) => ({ ...r, prId: master.id, slNo: i + 1 })),
      });
    }
    return tx.purchaseRequest.findUnique({
      where: { id: master.id },
      include: PR_INCLUDE,
    });
  }, TX_OPTS);

export const updatePurchaseRequest = (db, id, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    await tx.purchaseRequestDetail.deleteMany({ where: { prId: id } });
    await tx.purchaseRequest.update({ where: { id }, data: headerData });
    if (detailRows.length > 0) {
      await tx.purchaseRequestDetail.createMany({
        data: detailRows.map((r, i) => ({ ...r, prId: id, slNo: i + 1 })),
      });
    }
    return tx.purchaseRequest.findUnique({
      where: { id },
      include: PR_INCLUDE,
    });
  }, TX_OPTS);

export const deletePurchaseRequest = (db, id) =>
  db.purchaseRequest.delete({ where: { id } });
