import * as Model from '../models/qcCheckMethodModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middlewares/customErrors.js";


const buildData = (body) => ({
  checkCode:   body.checkCode?.trim().toUpperCase(),
  checkName:   body.checkName?.trim(),
  description: body.description?.trim() || null,
  status:      body.status || 'A',
  createdBy:   body.createdBy || 'ADMIN',
  updatedBy:   body.updatedBy || 'ADMIN',
});

export const getAll = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const data = await Model.getAll(req.db, { search });
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await Model.getById(req.db, id);
    if (!data) throw new NotFoundError('Record not found');
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const { checkCode, checkName } = req.body;
    if (!checkCode || !checkName) {
      throw new BadRequestError('checkCode and checkName are required');
    }
    const record = await Model.create(req.db, buildData(req.body));
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new BadRequestError('Check code already exists');
    }
    
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { checkCode, checkName } = req.body;
    if (!checkCode || !checkName) {
      throw new BadRequestError('checkCode and checkName are required');
    }
    const data = buildData(req.body);
    delete data.createdBy;
    const record = await Model.update(req.db, id, data);
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Record not found');
    }
    if (err.code === 'P2002') {
      throw new BadRequestError('Check code already exists');
    }
    
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await Model.remove(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Record not found');
    }
    
    throw err;
  }
};
