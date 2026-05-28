import * as Model from '../models/systemInfoMasterModel.js';

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
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const record = await Model.getById(req.db, id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    if (!req.body.dept?.trim())
      return res.status(400).json({ success: false, message: 'dept is required' });
    if (!req.body.userName?.trim())
      return res.status(400).json({ success: false, message: 'userName is required' });

    const data = build(req.body);
    data.createdBy = req.body.createdBy || 'Admin';
    data.updatedBy = req.body.createdBy || 'Admin';

    const record = await Model.create(req.db, data);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error('[systemInfoMaster] create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!req.body.dept?.trim())
      return res.status(400).json({ success: false, message: 'dept is required' });
    if (!req.body.userName?.trim())
      return res.status(400).json({ success: false, message: 'userName is required' });

    const data = build(req.body);
    data.updatedBy = req.body.updatedBy || 'Admin';

    const record = await Model.update(req.db, id, data);
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025')
      return res.status(404).json({ success: false, message: 'Record not found' });
    console.error('[systemInfoMaster] update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await Model.remove(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025')
      return res.status(404).json({ success: false, message: 'Record not found' });
    console.error('[systemInfoMaster] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
