import * as MachineModel from '../models/machineMasterModel.js';

const toDate = (v) => (v ? new Date(v) : null);

export const getAll = async (req, res) => {
  try {
    const data = await MachineModel.getAllMachines(req.db);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[machineMaster] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getNextCode = async (req, res) => {
  try {
    const nextCode = await MachineModel.getNextMachineCode(req.db);
    res.json({ success: true, nextCode });
  } catch (err) {
    console.error('[machineMaster] getNextCode error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const {
      machineCode, machineName, serialNo, machineCategoryId,
      workHoursPerDay, model, country, currency, vendorId,
      installationPlace, remarks, yearOfFG, dateOfPurchase,
      dateOfInstallation, warantyExpDate, amcExpDate, status, createdBy,
    } = req.body;

    if (!machineName || !machineName.trim()) {
      return res.status(400).json({ success: false, message: 'machineName is required' });
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
      return res.status(409).json({ success: false, message: 'Machine code already exists' });
    }
    console.error('[machineMaster] create error:', err);
    res.status(500).json({ success: false, message: err.message });
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
    } = req.body;

    if (!machineName || !machineName.trim()) {
      return res.status(400).json({ success: false, message: 'machineName is required' });
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
      return res.status(404).json({ success: false, message: 'Machine not found' });
    }
    console.error('[machineMaster] update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await MachineModel.deleteMachine(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Machine not found' });
    }
    console.error('[machineMaster] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
