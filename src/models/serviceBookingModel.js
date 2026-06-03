export const getAll = async (db) => {
  return db.serviceBooking.findMany({ orderBy: { createdAt: 'desc' } });
};

export const create = async (db, data) => {
  return db.serviceBooking.create({ data });
};

export const update = async (db, id, data) => {
  return db.serviceBooking.update({ where: { id }, data });
};

export const remove = async (db, id) => {
  return db.serviceBooking.delete({ where: { id } });
};
