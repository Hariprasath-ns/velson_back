import * as Model from '../models/qcCheckMethodModel.js';

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
    console.error('[qcCheckMethod] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await Model.getById(req.db, id);
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[qcCheckMethod] getOne error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { checkCode, checkName } = req.body;
    if (!checkCode || !checkName) {
      return res.status(400).json({ success: false, message: 'checkCode and checkName are required' });
    }
    const record = await Model.create(req.db, buildData(req.body));
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Check code already exists' });
    }
    console.error('[qcCheckMethod] create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { checkCode, checkName } = req.body;
    if (!checkCode || !checkName) {
      return res.status(400).json({ success: false, message: 'checkCode and checkName are required' });
    }
    const data = buildData(req.body);
    delete data.createdBy;
    const record = await Model.update(req.db, id, data);
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    if (err.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Check code already exists' });
    }
    console.error('[qcCheckMethod] update error:', err);
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
    console.error('[qcCheckMethod] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
