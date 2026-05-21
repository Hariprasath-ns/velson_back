import * as GateModel from '../models/gateMasterModel.js';

const toFloat = (v) => (v !== '' && v != null ? parseFloat(v) || 0 : 0);

const buildDetailRows = (items = []) =>
  items.map((item) => ({
    poNo:           item.poNo           || null,
    itemCode:       item.itemCode       || null,
    itemName:       item.itemName       || null,
    supplierPartNo: item.supplierPartNo || null,
    description:    item.description    || null,
    hsnCode:        item.hsnCode        || null,
    unit:           item.unit           || null,
    qty:            toFloat(item.qty),
    recQty:         toFloat(item.recQty),
  }));

export const getNextNo = async (req, res) => {
  try {
    const result = await GateModel.getNextGateNo(req.db);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[gateMaster] getNextNo error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const data = await GateModel.getAllGateEntries(req.db);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[gateMaster] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await GateModel.getGateEntryById(req.db, id);
    if (!data) return res.status(404).json({ success: false, message: 'Gate entry not found' });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[gateMaster] getOne error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const {
      gateEntryNo, financialYear, gateEntryDate,
      poId, poNo, prqNo, supplierName, supplierAddress,
      gateNo, carrierName, vehicleNo, invoiceNo, invoiceDate,
      remarks, status, createdBy, items,
    } = req.body;

    if (!gateEntryNo) {
      return res.status(400).json({ success: false, message: 'gateEntryNo is required' });
    }

    const headerData = {
      gateEntryNo:    gateEntryNo.trim(),
      financialYear:  financialYear   || '',
      gateEntryDate:  gateEntryDate ? new Date(gateEntryDate) : new Date(),
      poId:           poId ? parseInt(poId, 10) : null,
      poNo:           poNo            || null,
      prqNo:          prqNo           || null,
      supplierName:   supplierName    || null,
      supplierAddress: supplierAddress || null,
      gateNo:         gateNo          || null,
      carrierName:    carrierName     || null,
      vehicleNo:      vehicleNo       || null,
      invoiceNo:      invoiceNo       || null,
      invoiceDate:    invoiceDate ? new Date(invoiceDate) : null,
      remarks:        remarks         || null,
      status:         status          || 'Open',
      createdBy:      createdBy       || 'Admin',
      updatedBy:      createdBy       || 'Admin',
    };

    const record = await GateModel.createGateEntry(req.db, headerData, buildDetailRows(items));
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Gate entry number already exists' });
    }
    console.error('[gateMaster] create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      gateEntryDate, poId, poNo, prqNo, supplierName, supplierAddress,
      gateNo, carrierName, vehicleNo, invoiceNo, invoiceDate,
      remarks, status, updatedBy, items,
    } = req.body;

    const headerData = {
      gateEntryDate:  gateEntryDate ? new Date(gateEntryDate) : new Date(),
      poId:           poId ? parseInt(poId, 10) : null,
      poNo:           poNo            || null,
      prqNo:          prqNo           || null,
      supplierName:   supplierName    || null,
      supplierAddress: supplierAddress || null,
      gateNo:         gateNo          || null,
      carrierName:    carrierName     || null,
      vehicleNo:      vehicleNo       || null,
      invoiceNo:      invoiceNo       || null,
      invoiceDate:    invoiceDate ? new Date(invoiceDate) : null,
      remarks:        remarks         || null,
      status:         status          || 'Open',
      updatedBy:      updatedBy       || 'Admin',
    };

    const record = await GateModel.updateGateEntry(req.db, id, headerData, buildDetailRows(items));
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Gate entry not found' });
    }
    console.error('[gateMaster] update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await GateModel.deleteGateEntry(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Gate entry not found' });
    }
    console.error('[gateMaster] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
