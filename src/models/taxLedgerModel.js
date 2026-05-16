export const getAllTaxLedgers = (db) =>
  db.taxLedgerAccount.findMany({ orderBy: { ledgerName: "asc" } });

export const getTaxLedgerById = (db, id) =>
  db.taxLedgerAccount.findUnique({ where: { id } });

export const checkLedgerNameExists = async (db, ledgerName, excludeId = null) => {
  const where = excludeId
    ? { ledgerName, NOT: { id: excludeId } }
    : { ledgerName };
  const found = await db.taxLedgerAccount.findFirst({ where });
  return !!found;
};

export const createTaxLedger = (db, data) =>
  db.taxLedgerAccount.create({ data });

export const updateTaxLedger = (db, id, data) =>
  db.taxLedgerAccount.update({ where: { id }, data });

export const deleteTaxLedger = (db, id) =>
  db.taxLedgerAccount.delete({ where: { id } });
