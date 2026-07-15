export const getAll = async (db) => {
  return db.serviceDetail.findMany({ orderBy: { createdAt: 'desc' } });
};

export const create = async (db, data) => {
  return db.serviceDetail.create({ data });
};

export const update = async (db, id, data) => {
  return db.serviceDetail.update({ where: { id }, data });
};

export const remove = async (db, id) => {
  return db.serviceDetail.delete({ where: { id } });
};
