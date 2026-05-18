export const getAllSuppliers = (db) =>
  db.supplierMaster.findMany({ orderBy: { createdAt: 'asc' } });

export const getSupplierById = (db, id) =>
  db.supplierMaster.findUnique({ where: { id } });

export const getNextSCode = async (db) => {
  const rows = await db.$queryRaw`
    SELECT "sCode" FROM supplier_master
    WHERE "sCode" ~ '^SUP[0-9]+$'
    ORDER BY CAST(SUBSTRING("sCode" FROM 4) AS INTEGER) DESC
    LIMIT 1
  `;
  if (rows.length > 0) {
    const num = parseInt(rows[0].sCode.replace('SUP', ''), 10);
    return 'SUP' + String(num + 1);
  }
  return 'SUP100';
};

export const createSupplier = (db, data) =>
  db.supplierMaster.create({ data });

export const updateSupplier = (db, id, data) =>
  db.supplierMaster.update({ where: { id }, data });

export const deleteSupplier = (db, id) =>
  db.supplierMaster.delete({ where: { id } });
