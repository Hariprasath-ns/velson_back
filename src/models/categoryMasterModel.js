export const getAllCategories = (db) =>
  db.categoryMaster.findMany({ orderBy: { categoryName: 'asc' } });

export const getCategoryById = (db, id) =>
  db.categoryMaster.findUnique({ where: { id } });

export const createCategory = (db, data) =>
  db.categoryMaster.create({ data });

export const updateCategory = (db, id, data) =>
  db.categoryMaster.update({ where: { id }, data });

export const deleteCategory = (db, id) =>
  db.categoryMaster.delete({ where: { id } });
