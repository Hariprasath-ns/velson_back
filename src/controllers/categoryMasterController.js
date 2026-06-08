import * as CategoryModel from '../models/categoryMasterModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middelwares/customErrors.js";


export const getAll = async (req, res) => {
  try {
    const data = await CategoryModel.getAllCategories(req.db);
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const { categoryName } = req.body;
    if (!categoryName?.trim()) {
      throw new BadRequestError('categoryName is required');
    }
    const record = await CategoryModel.createCategory(req.db, {
      categoryName: categoryName.trim().toUpperCase(),
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    
    if (err.code === 'P2002') {
      throw new ConflictError('Category name already exists');
    }
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { categoryName } = req.body;
    if (!categoryName?.trim()) {
      throw new BadRequestError('categoryName is required');
    }
    const record = await CategoryModel.updateCategory(req.db, id, {
      categoryName: categoryName.trim().toUpperCase(),
    });
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Category not found');
    }
    if (err.code === 'P2002') {
      throw new ConflictError('Category name already exists');
    }
    
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await CategoryModel.deleteCategory(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Category not found');
    }
    
    throw err;
  }
};
