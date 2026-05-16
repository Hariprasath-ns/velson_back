import * as SubCatModel from '../models/subCategoryMasterModel.js';

export const getAll = async (req, res) => {
  try {
    const data = await SubCatModel.getAllSubCategories(req.db);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[subCategoryMaster] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getByCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, message: 'Invalid categoryId' });
    }
    const data = await SubCatModel.getSubCategoriesByCategory(req.db, categoryId);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[subCategoryMaster] getByCategory error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { categoryId, subCategoryName, prefixCode, description } = req.body;
    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'categoryId is required' });
    }
    if (!subCategoryName?.trim()) {
      return res.status(400).json({ success: false, message: 'subCategoryName is required' });
    }
    if (!prefixCode?.trim()) {
      return res.status(400).json({ success: false, message: 'prefixCode is required' });
    }
    const record = await SubCatModel.createSubCategory(req.db, {
      categoryId: Number(categoryId),
      subCategoryName: subCategoryName.trim().toUpperCase(),
      prefixCode: prefixCode.trim().toUpperCase(),
      description: description?.trim() || null,
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error('[subCategoryMaster] create error:', err);
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'SubCategory name already exists under this category' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ success: false, message: 'Category not found' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { categoryId, subCategoryName, prefixCode, description } = req.body;
    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'categoryId is required' });
    }
    if (!subCategoryName?.trim()) {
      return res.status(400).json({ success: false, message: 'subCategoryName is required' });
    }
    if (!prefixCode?.trim()) {
      return res.status(400).json({ success: false, message: 'prefixCode is required' });
    }
    const record = await SubCatModel.updateSubCategory(req.db, id, {
      categoryId: Number(categoryId),
      subCategoryName: subCategoryName.trim().toUpperCase(),
      prefixCode: prefixCode.trim().toUpperCase(),
      description: description?.trim() || null,
    });
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'SubCategory not found' });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'SubCategory name already exists under this category' });
    }
    console.error('[subCategoryMaster] update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await SubCatModel.deleteSubCategory(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'SubCategory not found' });
    }
    console.error('[subCategoryMaster] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
