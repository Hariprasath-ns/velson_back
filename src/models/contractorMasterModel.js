export const getAllContractors = (db) =>
  db.contractorMaster.findMany({ orderBy: { createdAt: 'asc' } });

export const getNextContractCode = async (db) => {
  const rows = await db.$queryRaw`
    SELECT "contractCode" FROM contractor_master
    WHERE "contractCode" ~ '^CONTRACTOR[0-9]+$'
    ORDER BY CAST(SUBSTRING("contractCode" FROM 11) AS INTEGER) DESC
    LIMIT 1
  `;
  if (rows.length > 0) {
    const num = parseInt(rows[0].contractCode.replace('CONTRACTOR', ''), 10);
    return 'CONTRACTOR' + String(num + 1).padStart(3, '0');
  }
  return 'CONTRACTOR001';
};

export const createContractor = (db, data) =>
  db.contractorMaster.create({ data });

export const updateContractor = (db, id, data) =>
  db.contractorMaster.update({ where: { id }, data });

export const deleteContractor = (db, id) =>
  db.contractorMaster.delete({ where: { id } });
