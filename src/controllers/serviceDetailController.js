import * as Model from '../models/serviceDetailModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middelwares/customErrors.js";


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
    const {
      serviceJobNo,
      customerCode,
      vehicleCount,
      customerName,
      bookingId,
      bookingDate,
      serialNo,
      vehicleNo,
      vehicleModelNo,
      modelSubType,
      vehicleName,
      status,
      remarks,
      servicePartNo,
      checkedAssemblies
    } = req.body;

    if (!serviceJobNo || !vehicleModelNo || !modelSubType || !vehicleName) {
      throw new BadRequestError('Required fields are missing');
    }

    const record = await Model.create(req.db, {
      serviceJobNo,
      customerCode: customerCode || null,
      vehicleCount: vehicleCount ? parseInt(vehicleCount, 10) : 1,
      customerName: customerName || null,
      bookingId: bookingId ? parseInt(bookingId, 10) : null,
      bookingDate: bookingDate || null,
      serialNo: serialNo || null,
      vehicleNo: vehicleNo || null,
      vehicleModelNo,
      modelSubType,
      vehicleName,
      status: status || 'Open',
      remarks: remarks || null,
      servicePartNo: servicePartNo || null,
      checkedAssemblies: Array.isArray(checkedAssemblies) ? checkedAssemblies.filter(id => id !== null && id !== undefined).map(id => String(id)) : []
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      serviceJobNo,
      customerCode,
      vehicleCount,
      customerName,
      bookingId,
      bookingDate,
      serialNo,
      vehicleNo,
      vehicleModelNo,
      modelSubType,
      vehicleName,
      status,
      remarks,
      servicePartNo,
      checkedAssemblies
    } = req.body;

    const record = await Model.update(req.db, id, {
      serviceJobNo,
      customerCode: customerCode || null,
      vehicleCount: vehicleCount ? parseInt(vehicleCount, 10) : undefined,
      customerName: customerName || null,
      bookingId: bookingId ? parseInt(bookingId, 10) : null,
      bookingDate: bookingDate || null,
      serialNo: serialNo || null,
      vehicleNo: vehicleNo || null,
      vehicleModelNo,
      modelSubType,
      vehicleName,
      status,
      remarks: remarks || null,
      servicePartNo: servicePartNo || null,
      checkedAssemblies: Array.isArray(checkedAssemblies) ? checkedAssemblies.filter(id => id !== null && id !== undefined).map(id => String(id)) : []
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
