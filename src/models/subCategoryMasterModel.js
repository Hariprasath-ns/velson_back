export const getAllSubCategories = (db) =>
  db.subCategoryMaster.findMany({
    include: { category: { select: { categoryName: true } } },
    orderBy: { subCategoryName: 'asc' },
  });

export const getSubCategoriesByCategory = (db, categoryId) =>
  db.subCategoryMaster.findMany({
    where: { categoryId: Number(categoryId) },
    orderBy: { subCategoryName: 'asc' },
  });

export const getSubCategoryById = (db, id) =>
  db.subCategoryMaster.findUnique({ where: { id } });

export const createSubCategory = (db, data) =>
  db.subCategoryMaster.create({ data });

export const updateSubCategory = (db, id, data) =>
  db.subCategoryMaster.update({ where: { id }, data });

export const deleteSubCategory = (db, id) =>
  db.subCategoryMaster.delete({ where: { id } });
