/**
 * Repository layer for ContractorMaster database operations using Prisma.
 */

export const findAll = (db) =>
  db.contractorMaster.findMany({ orderBy: { createdAt: 'asc' } });

export const findById = (db, id) =>
  db.contractorMaster.findUnique({ where: { id } });

export const findByContractCode = (db, contractCode) =>
  db.contractorMaster.findUnique({ where: { contractCode } });

export const create = (db, data) =>
  db.contractorMaster.create({ data });

export const update = (db, id, data) =>
  db.contractorMaster.update({ where: { id }, data });

export const remove = (db, id) =>
  db.contractorMaster.delete({ where: { id } });

/**
 * Returns the highest numerical CONTRACTORXXX code from the database.
 * Matches CONTRACTOR followed by numbers, ordering numerically.
 * 
 * @param {import('@prisma/client').PrismaClient} db
 * @returns {Promise<number>}
 */
export const findMaxContractCode = async (db) => {
  const rows = await db.$queryRaw`
    SELECT "contractCode" FROM contractor_master
    WHERE "contractCode" ~ '^CONTRACTOR[0-9]+$'
    ORDER BY CAST(SUBSTRING("contractCode" FROM 11) AS INTEGER) DESC
    LIMIT 1
  `;
  
  if (rows && rows.length > 0) {
    const code = rows[0].contractCode;
    const numStr = code.replace('CONTRACTOR', '');
    return parseInt(numStr, 10);
  }
  return 0;
};
