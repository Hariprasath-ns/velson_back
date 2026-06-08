import * as GateModel from '../models/gateMasterModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middelwares/customErrors.js";


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
    
    throw err;
  }
};

export const getAll = async (req, res) => {
  try {
    const data = await GateModel.getAllGateEntries(req.db);
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await GateModel.getGateEntryById(req.db, id);
    if (!data) throw new NotFoundError('Gate entry not found');
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
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
      throw new BadRequestError('gateEntryNo is required');
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
      throw new ConflictError('Gate entry number already exists');
    }
    
    throw err;
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
      throw new NotFoundError('Gate entry not found');
    }
    
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await GateModel.deleteGateEntry(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Gate entry not found');
    }
    
    throw err;
  }
};
