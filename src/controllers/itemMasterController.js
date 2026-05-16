import * as ItemMasterModel from '../models/itemMasterModel.js';

const parseOptInt   = v => (v !== '' && v != null) ? parseInt(v, 10)   : null;
const parseOptFloat = v => (v !== '' && v != null) ? parseFloat(v)      : null;

const buildData = (body) => ({
  groupId:         parseOptInt(body.groupId),
  partNo:          body.partNo?.trim(),
  outsourcePartNo: body.outsourcePartNo || null,
  partName:        body.partName?.trim(),
  modelId:         parseOptInt(body.modelId),
  brand:           body.brand || null,
  description:     body.description || null,
  size:            body.size || null,
  weight:          parseOptFloat(body.weight),
  unitId:          parseOptInt(body.unitId),
  hsnCode:         body.hsnCode || null,
  purchaseRate:    parseOptFloat(body.purchaseRate),
  marginPercent:   parseOptFloat(body.marginPercent),
  rate:            parseOptFloat(body.rate),
  currencyId:      parseOptInt(body.currencyId),
  taxId:           parseOptInt(body.taxId),
  subGroupId:      parseOptInt(body.subGroupId),
  storeId:         parseOptInt(body.storeId),
  rackNo:          body.rackNo || null,
  location:        body.location || null,
  itemTypeId:      parseOptInt(body.itemTypeId),
  qcTypeId:        parseOptInt(body.qcTypeId),
  materialGradeId: parseOptInt(body.materialGradeId),
  materialTypeId:  parseOptInt(body.materialTypeId),
  rawMaterialId:   parseOptInt(body.rawMaterialId),
  rmLength:        body.rmLength || null,
  rawMaterialWt:   parseOptFloat(body.rawMaterialWt),
  fgMaterialWt:    parseOptFloat(body.fgMaterialWt),
  reorderLevel:    parseOptFloat(body.reorderLevel),
  minStock:        parseOptFloat(body.minStock),
  createdBy:       body.createdBy || 'ADMIN',
  updatedBy:       body.updatedBy || 'ADMIN',
});

export const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const result = await ItemMasterModel.getItemMasters(req.db, { page, limit, search });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[itemMaster] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await ItemMasterModel.getItemMasterById(req.db, id);
    if (!data) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[itemMaster] getOne error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { partNo, partName } = req.body;
    if (!partNo || !partName) {
      return res.status(400).json({ success: false, message: 'partNo and partName are required' });
    }
    const record = await ItemMasterModel.createItemMaster(req.db, buildData(req.body));
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Part number already exists' });
    }
    console.error('[itemMaster] create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { partNo, partName } = req.body;
    if (!partNo || !partName) {
      return res.status(400).json({ success: false, message: 'partNo and partName are required' });
    }
    const data = buildData(req.body);
    delete data.createdBy;
    const record = await ItemMasterModel.updateItemMaster(req.db, id, data);
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    if (err.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Part number already exists' });
    }
    console.error('[itemMaster] update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await ItemMasterModel.deleteItemMaster(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    console.error('[itemMaster] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
