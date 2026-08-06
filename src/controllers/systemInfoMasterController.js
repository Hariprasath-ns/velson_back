import * as Model from '../models/systemInfoMasterModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middlewares/customErrors.js";


const build = (body) => ({
  dept:         body.dept?.trim()         || '',
  userName:     body.userName?.trim()     || '',
  gateWay:      body.gateWay?.trim()      || null,
  ip:           body.ip?.trim()           || null,
  ipAddress:    body.ipAddress?.trim()    || null,
  velsonNo:     body.velsonNo?.trim()     || null,
  macAddress:   body.macAddress?.trim()   || null,
  deviceName:   body.deviceName?.trim()   || null,
  manufacturer: body.manufacturer?.trim() || null,
});

export const getAll = async (req, res) => {
  try {
    const data = await Model.getAll(req.db);
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

export const getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const record = await Model.getById(req.db, id);
    if (!record) throw new NotFoundError('Record not found');
    res.json({ success: true, data: record });
  } catch (err) {
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    if (!req.body.dept?.trim())
      throw new BadRequestError('dept is required');
    if (!req.body.userName?.trim())
      throw new BadRequestError('userName is required');

    const data = build(req.body);
    data.createdBy = req.body.createdBy || 'Admin';
    data.updatedBy = req.body.createdBy || 'Admin';

    const record = await Model.create(req.db, data);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!req.body.dept?.trim())
      throw new BadRequestError('dept is required');
    if (!req.body.userName?.trim())
      throw new BadRequestError('userName is required');

    const data = build(req.body);
    data.updatedBy = req.body.updatedBy || 'Admin';

    const record = await Model.update(req.db, id, data);
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025')
      throw new NotFoundError('Record not found');
    
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await Model.remove(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025')
      throw new NotFoundError('Record not found');
    
    throw err;
  }
};
