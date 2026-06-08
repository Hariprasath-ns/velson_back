import * as SubCatModel from '../models/subCategoryMasterModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middelwares/customErrors.js";


export const getAll = async (req, res) => {
  try {
    const data = await SubCatModel.getAllSubCategories(req.db);
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const getByCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) {
      throw new BadRequestError('Invalid categoryId');
    }
    const data = await SubCatModel.getSubCategoriesByCategory(req.db, categoryId);
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const { categoryId, subCategoryName, prefixCode, description } = req.body;
    if (!categoryId) {
      throw new BadRequestError('categoryId is required');
    }
    if (!subCategoryName?.trim()) {
      throw new BadRequestError('subCategoryName is required');
    }
    if (!prefixCode?.trim()) {
      throw new BadRequestError('prefixCode is required');
    }
    const record = await SubCatModel.createSubCategory(req.db, {
      categoryId: Number(categoryId),
      subCategoryName: subCategoryName.trim().toUpperCase(),
      prefixCode: prefixCode.trim().toUpperCase(),
      description: description?.trim() || null,
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    
    if (err.code === 'P2002') {
      throw new ConflictError('SubCategory name already exists under this category');
    }
    if (err.code === 'P2003') {
      throw new BadRequestError('Category not found');
    }
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { categoryId, subCategoryName, prefixCode, description } = req.body;
    if (!categoryId) {
      throw new BadRequestError('categoryId is required');
    }
    if (!subCategoryName?.trim()) {
      throw new BadRequestError('subCategoryName is required');
    }
    if (!prefixCode?.trim()) {
      throw new BadRequestError('prefixCode is required');
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
      throw new NotFoundError('SubCategory not found');
    }
    if (err.code === 'P2002') {
      throw new ConflictError('SubCategory name already exists under this category');
    }
    
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await SubCatModel.deleteSubCategory(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('SubCategory not found');
    }
    
    throw err;
  }
};
