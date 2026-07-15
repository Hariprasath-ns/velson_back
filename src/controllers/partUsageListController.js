import * as PartUsageListModel from '../models/partUsageListModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middlewares/customErrors.js";


const buildData = (body) => ({
  partNo:       body.partNo?.trim(),
  partName:     body.partName?.trim(),
  group:        body.group || null,
  partSpareQty: body.partSpareQty !== '' && body.partSpareQty != null
    ? parseInt(body.partSpareQty, 10)
    : null,
  createdBy: body.createdBy || 'ADMIN',
  updatedBy: body.updatedBy || 'ADMIN',
});

export const getAll = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const data = await PartUsageListModel.getPartUsageLists(req.db, { search });
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await PartUsageListModel.getPartUsageListById(req.db, id);
    if (!data) throw new NotFoundError('Record not found');
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const { partNo, partName } = req.body;
    if (!partNo || !partName) {
      throw new BadRequestError('partNo and partName are required');
    }
    const record = await PartUsageListModel.createPartUsageList(req.db, buildData(req.body));
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { partNo, partName } = req.body;
    if (!partNo || !partName) {
      throw new BadRequestError('partNo and partName are required');
    }
    const data = buildData(req.body);
    delete data.createdBy;
    const record = await PartUsageListModel.updatePartUsageList(req.db, id, data);
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
    const id = parseInt(req.params.id, 10);
    await PartUsageListModel.deletePartUsageList(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Record not found');
    }
    
    throw err;
  }
};
