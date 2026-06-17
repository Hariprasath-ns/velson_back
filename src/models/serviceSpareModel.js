export const getAll = async (db) => {
  return db.serviceSpare.findMany({ orderBy: { createdAt: 'desc' } });
};

export const create = async (db, data) => {
  return db.serviceSpare.create({ data });
};

export const update = async (db, id, data) => {
  return db.serviceSpare.update({ where: { id }, data });
};

export const remove = async (db, id) => {
  return db.serviceSpare.delete({ where: { id } });
};
