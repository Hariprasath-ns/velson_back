export const getAllTaxMasters = (db) =>
  db.taxMaster.findMany({
    include: { taxLedger: true },
    orderBy: { id: "asc" },
  });

export const getTaxMasterById = (db, id) =>
  db.taxMaster.findUnique({
    where: { id },
    include: { taxLedger: true },
  });

export const createTaxMaster = (db, data) =>
  db.taxMaster.create({ data, include: { taxLedger: true } });

export const updateTaxMaster = (db, id, data) =>
  db.taxMaster.update({ where: { id }, data, include: { taxLedger: true } });

export const deleteTaxMaster = (db, id) =>
  db.taxMaster.delete({ where: { id } });
