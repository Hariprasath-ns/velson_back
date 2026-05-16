import * as CategoryModel from '../models/categoryMasterModel.js';

export const getAll = async (req, res) => {
  try {
    const data = await CategoryModel.getAllCategories(req.db);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[categoryMaster] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { categoryName } = req.body;
    if (!categoryName?.trim()) {
      return res.status(400).json({ success: false, message: 'categoryName is required' });
    }
    const record = await CategoryModel.createCategory(req.db, {
      categoryName: categoryName.trim().toUpperCase(),
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error('[categoryMaster] create error:', err);
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Category name already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { categoryName } = req.body;
    if (!categoryName?.trim()) {
      return res.status(400).json({ success: false, message: 'categoryName is required' });
    }
    const record = await CategoryModel.updateCategory(req.db, id, {
      categoryName: categoryName.trim().toUpperCase(),
    });
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Category name already exists' });
    }
    console.error('[categoryMaster] update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await CategoryModel.deleteCategory(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    console.error('[categoryMaster] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
