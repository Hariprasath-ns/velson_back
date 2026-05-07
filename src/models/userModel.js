export const createUser = (db, data) =>
  db.user.create({ data });

export const getAllUsers = (db) =>
  db.user.findMany({ orderBy: { createdAt: "desc" } });

export const getUserById = (db, id) =>
  db.user.findUnique({ where: { id } });

export const updateUser = (db, id, data) =>
  db.user.update({ where: { id }, data });

export const deleteUser = (db, id) =>
  db.user.delete({ where: { id } });
