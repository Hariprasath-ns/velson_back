export const getAllCompanies = (db) =>
  db.companyMaster.findMany({ orderBy: { createdAt: 'asc' } });

export const getCompanyById = (db, id) =>
  db.companyMaster.findUnique({ where: { id } });

export const getNextCompanyCode = async (db) => {
  const rows = await db.$queryRaw`
    SELECT "companyCode" FROM company_master
    WHERE "companyCode" ~ '^COMP[0-9]+$'
    ORDER BY CAST(SUBSTRING("companyCode" FROM 5) AS INTEGER) DESC
    LIMIT 1
  `;
  if (rows.length > 0) {
    const num = parseInt(rows[0].companyCode.replace('COMP', ''), 10);
    return 'COMP' + String(num + 1);
  }
  return 'COMP100';
};

export const createCompany = (db, data) =>
  db.companyMaster.create({ data });

export const updateCompany = (db, id, data) =>
  db.companyMaster.update({ where: { id }, data });

export const deleteCompany = (db, id) =>
  db.companyMaster.delete({ where: { id } });
