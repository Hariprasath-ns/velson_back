export const getAllProcesses = (db) =>
  db.processMaster.findMany({ orderBy: { id: 'desc' } });

export const getProcessById = (db, id) =>
  db.processMaster.findUnique({ where: { id } });

export const createProcess = (db, data) =>
  db.processMaster.create({ data });

export const updateProcess = (db, id, data) =>
  db.processMaster.update({ where: { id }, data });

export const deleteProcess = (db, id) =>
  db.processMaster.delete({ where: { id } });

export const deleteAllProcesses = (db) =>
  db.processMaster.deleteMany({});
