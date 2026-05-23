import * as Model from '../models/vehicleServiceMasterModel.js';

export const getAll = async (req, res) => {
  try {
    const data = await Model.getAll(req.db);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[vehicleServiceMaster] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { vehicleTypeId, serviceName, labourCharge, materialCharge, createdBy } = req.body;
    if (!vehicleTypeId || !serviceName?.trim()) {
      return res.status(400).json({ success: false, message: 'vehicleTypeId and serviceName are required' });
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
    console.error('[vehicleServiceMaster] create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { vehicleTypeId, serviceName, labourCharge, materialCharge, updatedBy } = req.body;
    if (!vehicleTypeId || !serviceName?.trim()) {
      return res.status(400).json({ success: false, message: 'vehicleTypeId and serviceName are required' });
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
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    console.error('[vehicleServiceMaster] update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await Model.remove(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    console.error('[vehicleServiceMaster] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
