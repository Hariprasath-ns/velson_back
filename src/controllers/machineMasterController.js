import * as MachineModel from '../models/machineMasterModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middelwares/customErrors.js";


const toDate = (v) => (v ? new Date(v) : null);

export const getAll = async (req, res) => {
  try {
    const data = await MachineModel.getAllMachines(req.db);
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const getNextCode = async (req, res) => {
  try {
    const nextCode = await MachineModel.getNextMachineCode(req.db);
    res.json({ success: true, nextCode });
  } catch (err) {
    
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const {
      machineCode, machineName, serialNo, machineCategoryId,
      workHoursPerDay, model, country, currency, vendorId,
      installationPlace, remarks, yearOfFG, dateOfPurchase,
      dateOfInstallation, warantyExpDate, amcExpDate, status, createdBy,
      manufacture, price,
    } = req.body;

    if (!machineName || !machineName.trim()) {
      throw new BadRequestError('machineName is required');
    }

    const resolvedCode = machineCode && machineCode.trim()
      ? machineCode.trim()
      : await MachineModel.getNextMachineCode(req.db);

    const record = await MachineModel.createMachine(req.db, {
      machineCode:        resolvedCode,
      machineName:        machineName.trim(),
      serialNo:           serialNo           || null,
      machineCategoryId:  machineCategoryId  || null,
      workHoursPerDay:    workHoursPerDay    || null,
      model:              model              || null,
      country:            country            || null,
      currency:           currency           || null,
      vendorId:           vendorId           || null,
      installationPlace:  installationPlace  || null,
      remarks:            remarks            || null,
      manufacture:        manufacture        || null,
      price:              (price !== undefined && price !== null && price !== '') ? parseFloat(price) : null,
      yearOfFG:           toDate(yearOfFG),
      dateOfPurchase:     toDate(dateOfPurchase),
      dateOfInstallation: toDate(dateOfInstallation),
      warantyExpDate:     toDate(warantyExpDate),
      amcExpDate:         toDate(amcExpDate),
      status:             status             || 'Active',
      createdBy:          createdBy          || 'Admin',
      updatedBy:          createdBy          || 'Admin',
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ConflictError('Machine code already exists');
    }
    
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      machineName, serialNo, machineCategoryId,
      workHoursPerDay, model, country, currency, vendorId,
      installationPlace, remarks, yearOfFG, dateOfPurchase,
      dateOfInstallation, warantyExpDate, amcExpDate, status, updatedBy,
      manufacture, price,
    } = req.body;

    if (!machineName || !machineName.trim()) {
      throw new BadRequestError('machineName is required');
    }

    const record = await MachineModel.updateMachine(req.db, id, {
      machineName:        machineName.trim(),
      serialNo:           serialNo           || null,
      machineCategoryId:  machineCategoryId  || null,
      workHoursPerDay:    workHoursPerDay    || null,
      model:              model              || null,
      country:            country            || null,
      currency:           currency           || null,
      vendorId:           vendorId           || null,
      installationPlace:  installationPlace  || null,
      remarks:            remarks            || null,
      manufacture:        manufacture        || null,
      price:              (price !== undefined && price !== null && price !== '') ? parseFloat(price) : null,
      yearOfFG:           toDate(yearOfFG),
      dateOfPurchase:     toDate(dateOfPurchase),
      dateOfInstallation: toDate(dateOfInstallation),
      warantyExpDate:     toDate(warantyExpDate),
      amcExpDate:         toDate(amcExpDate),
      status:             status             || 'Active',
      updatedBy:          updatedBy          || 'Admin',
    });

    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Machine not found');
    }
    
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await MachineModel.deleteMachine(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Machine not found');
    }
    
    throw err;
  }
};
