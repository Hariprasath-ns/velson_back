export const getAllReferenceTypes = (db) =>
  db.referenceType.findMany({ orderBy: { name: "asc" } });

// Looks up reference_type by name (validates the type exists), then returns
// reference_master values for that type. Uses the string-based referenceType
// field because legacy records may have referenceTypeId = null.
export const getValuesByTypeName = async (db, name) => {
  const refType = await db.referenceType.findUnique({ where: { name } });
  if (!refType) return [];
  const values = await db.referenceMaster.findMany({
    where: { referenceType: name },
    orderBy: { code: 'asc' },
    select: { id: true, code: true, description: true },
  });
  return values;
};

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
