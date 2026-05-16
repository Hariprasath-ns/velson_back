import * as ItemGroupModel from '../models/itemGroupMasterModel.js';

export const getAll = async (req, res) => {
  try {
    const data = await ItemGroupModel.getAllItemGroups(req.db);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[itemGroupMaster] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { groupName, store, prefix } = req.body;
    if (!groupName || !store || !prefix) {
      return res.status(400).json({ success: false, message: 'groupName, store, and prefix are required' });
    }
    const record = await ItemGroupModel.createItemGroup(req.db, { groupName, store, prefix });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error('[itemGroupMaster] create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { groupName, store, prefix } = req.body;
    if (!groupName || !store || !prefix) {
      return res.status(400).json({ success: false, message: 'groupName, store, and prefix are required' });
    }
    const record = await ItemGroupModel.updateItemGroup(req.db, id, { groupName, store, prefix });
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    console.error('[itemGroupMaster] update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await ItemGroupModel.deleteItemGroup(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    console.error('[itemGroupMaster] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
