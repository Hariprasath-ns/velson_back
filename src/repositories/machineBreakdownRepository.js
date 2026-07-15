export const findAll = (db) =>
  db.machineBreakdown.findMany({ orderBy: { createdAt: 'desc' } });

export const findById = (db, id) =>
  db.machineBreakdown.findUnique({ where: { id } });

export const findByMwrNo = (db, mwrNo) => {
  console.log("DB KEYS IN REPO:", db ? Object.keys(db) : "null/undefined");
  return db.machineBreakdown.findUnique({ where: { mwrNo } });
};

export const create = (db, data) =>
  db.machineBreakdown.create({ data });

export const update = (db, id, data) =>
  db.machineBreakdown.update({ where: { id }, data });

export const remove = (db, id) =>
  db.machineBreakdown.delete({ where: { id } });

export const findMaxMwrNo = async (db) => {
  const rows = await db.$queryRaw`
    SELECT "mwrNo" FROM machine_breakdown
    WHERE "mwrNo" ~ '^[0-9]+$'
    ORDER BY CAST("mwrNo" AS INTEGER) DESC
    LIMIT 1
  `;
  if (rows.length > 0) {
    return parseInt(rows[0].mwrNo, 10);
  }
  return 0;
};
