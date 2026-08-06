export const getAll = (db) =>
  db.vehicleServiceMaster.findMany({ orderBy: { createdAt: 'desc' } });

export const create = (db, data) =>
  db.vehicleServiceMaster.create({ data });

export const update = (db, id, data) =>
  db.vehicleServiceMaster.update({ where: { id }, data });

export const remove = (db, id) =>
  db.vehicleServiceMaster.delete({ where: { id } });
