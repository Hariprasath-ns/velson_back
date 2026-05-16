import * as PrefixModel from '../models/prefixModel.js';

export const getAll = async (req, res) => {
  try {
    const data = await PrefixModel.getAllPrefixes(req.db);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[prefix] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { prefixCode } = req.body;
    if (!prefixCode || !prefixCode.trim()) {
      return res.status(400).json({ success: false, message: 'prefixCode is required' });
    }
    const record = await PrefixModel.createPrefix(req.db, {
      prefixCode: prefixCode.trim().toUpperCase(),
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: `Prefix "${req.body.prefixCode}" already exists.` });
    }
    console.error('[prefix] create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { prefixCode } = req.body;
    if (!prefixCode || !prefixCode.trim()) {
      return res.status(400).json({ success: false, message: 'prefixCode is required' });
    }
    const record = await PrefixModel.updatePrefix(req.db, id, {
      prefixCode: prefixCode.trim().toUpperCase(),
    });
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Prefix not found' });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: `Prefix "${req.body.prefixCode}" already exists.` });
    }
    console.error('[prefix] update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await PrefixModel.deletePrefix(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Prefix not found' });
    }
    console.error('[prefix] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
