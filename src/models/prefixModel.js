export const getAllPrefixes = (db) =>
  db.prefix.findMany({ orderBy: { prefixCode: 'asc' } });

export const createPrefix = (db, data) =>
  db.prefix.create({ data });

export const updatePrefix = (db, id, data) =>
  db.prefix.update({ where: { id }, data });

export const deletePrefix = (db, id) =>
  db.prefix.delete({ where: { id } });
