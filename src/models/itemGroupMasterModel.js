export const getAllItemGroups = (db) =>
  db.itemGroupMaster.findMany({ orderBy: { groupName: 'asc' } });

export const createItemGroup = (db, data) =>
  db.itemGroupMaster.create({ data });

export const updateItemGroup = (db, id, data) =>
  db.itemGroupMaster.update({ where: { id }, data });

export const deleteItemGroup = (db, id) =>
  db.itemGroupMaster.delete({ where: { id } });
