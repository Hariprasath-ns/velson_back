import { getFinancialYear } from "../utils/date.js";

export const getNextGateNo = async (db) => {
  const fy = getFinancialYear();
  const pattern = `${fy}/GE%`;
  const rows = await db.$queryRaw`
    SELECT "gateEntryNo" FROM gate_master
    WHERE "gateEntryNo" LIKE ${pattern}
    ORDER BY "gateEntryNo" DESC
    LIMIT 1
  `;
  if (rows.length > 0) {
    const prefix = `${fy}/GE`;
    const seq = parseInt(rows[0].gateEntryNo.replace(prefix, ''), 10);
    return { gateEntryNo: `${prefix}${String(seq + 1).padStart(5, '0')}`, financialYear: fy };
  }
  return { gateEntryNo: `${fy}/GE00001`, financialYear: fy };
};

export const getAllGateEntries = async (db, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    db.gateMaster.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { details: { orderBy: { slNo: 'asc' } } },
    }),
    db.gateMaster.count()
  ]);
  return { data, total, page, limit };
};

export const getGateEntryById = (db, id) =>
  db.gateMaster.findUnique({
    where: { id },
    include: { details: { orderBy: { slNo: 'asc' } } },
  });

const TX_OPTS = { maxWait: 10000, timeout: 20000 };

export const createGateEntry = (db, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    const master = await tx.gateMaster.create({ data: headerData });
    if (detailRows.length > 0) {
      await tx.gateDetail.createMany({
        data: detailRows.map((r, i) => ({ ...r, gateId: master.id, slNo: i + 1 })),
      });
    }
    return tx.gateMaster.findUnique({
      where: { id: master.id },
      include: { details: { orderBy: { slNo: 'asc' } } },
    });
  }, TX_OPTS);

export const updateGateEntry = (db, id, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    await tx.gateDetail.deleteMany({ where: { gateId: id } });
    await tx.gateMaster.update({ where: { id }, data: headerData });
    if (detailRows.length > 0) {
      await tx.gateDetail.createMany({
        data: detailRows.map((r, i) => ({ ...r, gateId: id, slNo: i + 1 })),
      });
    }
    return tx.gateMaster.findUnique({
      where: { id },
      include: { details: { orderBy: { slNo: 'asc' } } },
    });
  }, TX_OPTS);

export const deleteGateEntry = (db, id) =>
  db.gateMaster.delete({ where: { id } });
