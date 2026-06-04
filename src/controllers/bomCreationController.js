import * as BomModel from '../models/bomCreationModel.js';

export const getAll = async (req, res) => {
  try {
    const data = await BomModel.getAllBomCreations(req.db);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[bomCreation] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const {
      bomNo, date, customerName, customerCode, vehicleCount,
      serviceJobNo, vehicleSerialNo, model, fileLocation,
      fileName, groupName, assemblyPartNo, status, excelRows,
      createdBy
    } = req.body;

    if (!customerName || !String(customerName).trim()) {
      return res.status(400).json({ success: false, message: 'customerName is required' });
    }
    if (!serviceJobNo || !String(serviceJobNo).trim()) {
      return res.status(400).json({ success: false, message: 'serviceJobNo is required' });
    }

    const record = await BomModel.createBomCreation(req.db, {
      bomNo: bomNo || `BOM-${Date.now()}`,
      date: date ? new Date(date) : new Date(),
      customerName: String(customerName).trim(),
      customerCode: customerCode || null,
      vehicleCount: vehicleCount ? parseInt(vehicleCount) : null,
      serviceJobNo: String(serviceJobNo).trim(),
      vehicleSerialNo: vehicleSerialNo || null,
      model: model || null,
      fileLocation: fileLocation || null,
      fileName: fileName || null,
      groupName: groupName || null,
      assemblyPartNo: assemblyPartNo || null,
      status: status || 'Created',
      excelRows: excelRows || null,
      createdBy: createdBy || 'Admin',
      updatedBy: createdBy || 'Admin',
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'BOM No already exists' });
    }
    console.error('[bomCreation] create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      bomNo, date, customerName, customerCode, vehicleCount,
      serviceJobNo, vehicleSerialNo, model, fileLocation,
      fileName, groupName, assemblyPartNo, status, excelRows,
      updatedBy
    } = req.body;

    if (!customerName || !String(customerName).trim()) {
      return res.status(400).json({ success: false, message: 'customerName is required' });
    }

    const record = await BomModel.updateBomCreation(req.db, id, {
      bomNo: bomNo ? String(bomNo).trim() : undefined,
      date: date ? new Date(date) : undefined,
      customerName: String(customerName).trim(),
      customerCode: customerCode || null,
      vehicleCount: vehicleCount ? parseInt(vehicleCount) : null,
      serviceJobNo: serviceJobNo ? String(serviceJobNo).trim() : undefined,
      vehicleSerialNo: vehicleSerialNo || null,
      model: model || null,
      fileLocation: fileLocation || null,
      fileName: fileName || null,
      groupName: groupName || null,
      assemblyPartNo: assemblyPartNo || null,
      status: status || 'Created',
      excelRows: excelRows || null,
      updatedBy: updatedBy || 'Admin',
    });

    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'BOM record not found' });
    }
    console.error('[bomCreation] update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await BomModel.deleteBomCreation(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'BOM record not found' });
    }
    console.error('[bomCreation] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
