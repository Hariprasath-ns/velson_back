export const getAllBomCreations = (db) =>
  db.bomCreation.findMany({
    orderBy: { createdAt: 'desc' },
  });

export const getBomCreationById = (db, id) =>
  db.bomCreation.findUnique({
    where: { id },
  });

export const createBomCreation = (db, data) =>
  db.bomCreation.create({
    data,
  });

export const updateBomCreation = (db, id, data) =>
  db.bomCreation.update({
    where: { id },
    data,
  });

export const deleteBomCreation = (db, id) =>
  db.bomCreation.delete({ where: { id } });
