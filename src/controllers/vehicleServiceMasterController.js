import * as Model from '../models/vehicleServiceMasterModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middlewares/customErrors.js";


export const getAll = async (req, res) => {
  try {
    const data = await Model.getAll(req.db);
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const { vehicleTypeId, serviceName, labourCharge, materialCharge, createdBy } = req.body;
    if (!vehicleTypeId || !serviceName?.trim()) {
      throw new BadRequestError('vehicleTypeId and serviceName are required');
    }
    const record = await Model.create(req.db, {
      vehicleTypeId,
      serviceName: serviceName.trim(),
      labourCharge:   parseFloat(labourCharge)   || 0,
      materialCharge: parseFloat(materialCharge) || 0,
      createdBy: createdBy || 'Admin',
      updatedBy: createdBy || 'Admin',
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { vehicleTypeId, serviceName, labourCharge, materialCharge, updatedBy } = req.body;
    if (!vehicleTypeId || !serviceName?.trim()) {
      throw new BadRequestError('vehicleTypeId and serviceName are required');
    }
    const record = await Model.update(req.db, id, {
      vehicleTypeId,
      serviceName: serviceName.trim(),
      labourCharge:   parseFloat(labourCharge)   || 0,
      materialCharge: parseFloat(materialCharge) || 0,
      updatedBy: updatedBy || 'Admin',
    });
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
    await Model.remove(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Record not found');
    }
    
    throw err;
  }
};
