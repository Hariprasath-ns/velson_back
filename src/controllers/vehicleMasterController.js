import * as VehicleModel from '../models/vehicleMasterModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middlewares/customErrors.js";


export const getAll = async (req, res) => {
  try {
    const data = await VehicleModel.getAllVehicles(req.db);
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const {
      customerId, entryDate, vehicleCount, address, vehicleNumber,
      modelName, modelSubType, vehicleName, serialNumber,
      bomType, bomModelNumber, remarks, createdBy,
    } = req.body;

    if (!customerId) {
      throw new BadRequestError('customerId is required');
    }
    if (!modelName || !String(modelName).trim()) {
      throw new BadRequestError('modelName is required');
    }
    if (!vehicleName || !String(vehicleName).trim()) {
      throw new BadRequestError('vehicleName is required');
    }

    const record = await VehicleModel.createVehicle(req.db, {
      customerId: parseInt(customerId),
      entryDate: entryDate ? new Date(entryDate) : new Date(),
      vehicleCount: vehicleCount ? parseInt(vehicleCount) : 1,
      address: address || null,
      vehicleNumber: vehicleNumber || null,
      modelName: String(modelName).trim(),
      modelSubType: modelSubType || null,
      vehicleName: String(vehicleName).trim(),
      serialNumber: serialNumber || null,
      bomType: bomType || 'New',
      bomModelNumber: bomModelNumber || null,
      remarks: remarks || null,
      createdBy: createdBy || 'Admin',
      updatedBy: createdBy || 'Admin',
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2003') {
      throw new BadRequestError('Referenced customer does not exist');
    }
    
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      customerId, entryDate, vehicleCount, address, vehicleNumber,
      modelName, modelSubType, vehicleName, serialNumber,
      bomType, bomModelNumber, remarks, updatedBy,
    } = req.body;

    if (!customerId) {
      throw new BadRequestError('customerId is required');
    }
    if (!modelName || !String(modelName).trim()) {
      throw new BadRequestError('modelName is required');
    }
    if (!vehicleName || !String(vehicleName).trim()) {
      throw new BadRequestError('vehicleName is required');
    }

    const record = await VehicleModel.updateVehicle(req.db, id, {
      customerId: parseInt(customerId),
      entryDate: entryDate ? new Date(entryDate) : undefined,
      vehicleCount: vehicleCount ? parseInt(vehicleCount) : 1,
      address: address || null,
      vehicleNumber: vehicleNumber || null,
      modelName: String(modelName).trim(),
      modelSubType: modelSubType || null,
      vehicleName: String(vehicleName).trim(),
      serialNumber: serialNumber || null,
      bomType: bomType || 'New',
      bomModelNumber: bomModelNumber || null,
      remarks: remarks || null,
      updatedBy: updatedBy || 'Admin',
    });

    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Vehicle record not found');
    }
    if (err.code === 'P2003') {
      throw new BadRequestError('Referenced customer does not exist');
    }
    
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await VehicleModel.deleteVehicle(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Vehicle record not found');
    }
    
    throw err;
  }
};
