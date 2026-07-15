export const createReferenceMaster = (db, data) =>
  db.referenceMaster.create({ data });

export const getReferenceMastersByType = async (db, type) => {
  // LPAD pads numeric-looking codes so "2" sorts before "10" correctly.
  const records = await db.$queryRaw`
    SELECT * FROM reference_master
    WHERE "referenceType" = ${type}
    ORDER BY
      CASE WHEN code ~ '^[0-9]+$' THEN LPAD(code, 10, '0') ELSE code END ASC
  `;
  return records;
};

export const getNextCodeForType = async (db, type) => {
  const rows = await db.$queryRaw`
    SELECT code FROM reference_master
    WHERE "referenceType" = ${type}
      AND code ~ '^[0-9]+$'
    ORDER BY code::int DESC
    LIMIT 1
  `;
  if (rows.length > 0) {
    const last = parseInt(rows[0].code, 10);
    return String(last + 1).padStart(3, "0");
  }
  return "001";
};

export const updateReferenceMaster = (db, id, data) =>
  db.referenceMaster.update({ where: { id }, data });

export const deleteReferenceMaster = (db, id) =>
  db.referenceMaster.delete({ where: { id } });
