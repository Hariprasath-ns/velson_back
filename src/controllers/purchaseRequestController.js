import * as PRModel from '../models/purchaseRequestModel.js';

const toFloat = (v) => (v !== '' && v != null ? parseFloat(v) || 0 : 0);
const toInt   = (v) => (v !== '' && v != null ? parseInt(v, 10) || null : null);

const buildDetailRows = (items = []) =>
  items.map((item) => ({
    itemId:        item.itemId ? parseInt(item.itemId, 10) : null,
    itemCode:      item.itemCode      || null,
    itemName:      item.itemName      || null,
    specification: item.specification || null,
    jobNo:         item.jobNo         || null,
    machineNo:     item.machineNo     || null,
    uom:           item.uom           || null,
    qty:           toFloat(item.qty),
    eta:           item.eta ? new Date(item.eta) : null,
    purpose:       item.purpose       || null,
  }));

export const getNextNo = async (req, res) => {
  try {
    const result = await PRModel.getNextPrNo(req.db);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[purchaseRequest] getNextNo error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const data = await PRModel.getAllPurchaseRequests(req.db);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[purchaseRequest] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await PRModel.getPurchaseRequestById(req.db, id);
    if (!data) return res.status(404).json({ success: false, message: 'Purchase request not found' });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[purchaseRequest] getOne error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const {
      prNo, financialYear, prDate, requiredDate,
      department, departmentId,
      requestingUser,
      team, teamId,
      requestingFor, requestingForId, remarks, status, createdBy, items,
    } = req.body;

    if (!prNo) {
      return res.status(400).json({ success: false, message: 'prNo is required' });
    }

    const headerData = {
      prNo:             prNo.trim(),
      financialYear:    financialYear    || '',
      prDate:           prDate ? new Date(prDate) : new Date(),
      requiredDate:     requiredDate ? new Date(requiredDate) : null,
      department:       department       || null,
      departmentId:     toInt(departmentId),
      requestingUser:   requestingUser   || null,
      team:             team             || null,
      teamId:           toInt(teamId),
      requestingFor:    requestingFor    || null,
      requestingForId:  toInt(requestingForId),
      remarks:          remarks          || null,
      status:           status           || 'Draft',
      createdBy:        createdBy        || 'Admin',
      updatedBy:        createdBy        || 'Admin',
    };

    const record = await PRModel.createPurchaseRequest(req.db, headerData, buildDetailRows(items));
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Purchase request number already exists' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ success: false, message: 'Invalid department or team reference' });
    }
    console.error('[purchaseRequest] create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      prDate, requiredDate,
      department, departmentId,
      requestingUser,
      team, teamId,
      requestingFor, requestingForId, remarks, status, poNo, poDate, updatedBy, items,
    } = req.body;

    const headerData = {
      prDate:           prDate ? new Date(prDate) : new Date(),
      requiredDate:     requiredDate ? new Date(requiredDate) : null,
      department:       department       || null,
      departmentId:     toInt(departmentId),
      requestingUser:   requestingUser   || null,
      team:             team             || null,
      teamId:           toInt(teamId),
      requestingFor:    requestingFor    || null,
      requestingForId:  toInt(requestingForId),
      remarks:          remarks          || null,
      status:           status           || 'Draft',
      ...(poNo  !== undefined && { poNo:  poNo  || null }),
      ...(poDate !== undefined && { poDate: poDate ? new Date(poDate) : null }),
      updatedBy:        updatedBy        || 'Admin',
    };

    const record = await PRModel.updatePurchaseRequest(req.db, id, headerData, buildDetailRows(items));
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Purchase request not found' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ success: false, message: 'Invalid department or team reference' });
    }
    console.error('[purchaseRequest] update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await PRModel.deletePurchaseRequest(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Purchase request not found' });
    }
    console.error('[purchaseRequest] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
