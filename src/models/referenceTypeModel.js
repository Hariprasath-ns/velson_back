export const getAllReferenceTypes = (db) =>
  db.referenceType.findMany({ orderBy: { name: "asc" } });

export const getReferenceTypeById = (db, id) =>
  db.referenceType.findUnique({ where: { id } });

export const getNextReferenceTypeCode = async (db) => {
  const rows = await db.$queryRaw`
    SELECT code FROM "reference_type"
    WHERE code ~ '^[0-9]+$'
    ORDER BY code::int DESC
    LIMIT 1
  `;
  if (rows.length > 0) {
    return String(parseInt(rows[0].code, 10) + 1).padStart(3, "0");
  }
  return "001";
};

export const createReferenceType = (db, data) =>
  db.referenceType.create({ data });

export const updateReferenceType = (db, id, data) =>
  db.referenceType.update({ where: { id }, data });

export const deleteReferenceType = (db, id) =>
  db.referenceType.delete({ where: { id } });
