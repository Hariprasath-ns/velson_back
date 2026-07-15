import * as ItemGroupModel from '../models/itemGroupMasterModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middlewares/customErrors.js";


export const getAll = async (req, res) => {
  try {
    const data = await ItemGroupModel.getAllItemGroups(req.db);
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const { groupName, store, prefix } = req.body;
    if (!groupName || !store || !prefix) {
      throw new BadRequestError('groupName, store, and prefix are required');
    }
    const record = await ItemGroupModel.createItemGroup(req.db, { groupName, store, prefix });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { groupName, store, prefix } = req.body;
    if (!groupName || !store || !prefix) {
      throw new BadRequestError('groupName, store, and prefix are required');
    }
    const record = await ItemGroupModel.updateItemGroup(req.db, id, { groupName, store, prefix });
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Record not found');
    }
    
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await ItemGroupModel.deleteItemGroup(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Record not found');
    }
    
    throw err;
  }
};
