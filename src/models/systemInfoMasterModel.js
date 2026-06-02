export const getAll = (db) =>
  db.systemInfoMaster.findMany({ orderBy: { createdAt: 'asc' } });

export const getById = (db, id) =>
  db.systemInfoMaster.findUnique({ where: { id } });

export const create = (db, data) =>
  db.systemInfoMaster.create({ data });

export const update = (db, id, data) =>
  db.systemInfoMaster.update({ where: { id }, data });

export const remove = (db, id) =>
  db.systemInfoMaster.delete({ where: { id } });
