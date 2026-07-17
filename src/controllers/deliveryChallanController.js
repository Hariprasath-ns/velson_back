import * as DcModel from '../models/deliveryChallanModel.js';
import { BadRequestError, NotFoundError, ConflictError } from "../middlewares/customErrors.js";
import { eventBus } from '../services/eventBus.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';

const toFloat = (v) => (v !== '' && v != null ? parseFloat(v) || 0 : 0);
const toInt   = (v) => (v !== '' && v != null ? parseInt(v, 10) || null : null);

const buildDetailRows = (items = []) =>
  items.map((item) => ({
    slNo:          toInt(item.slNo) || 1,
    barcode:       item.barcode     || null,
    partNo:        item.partNo      || '',
    partName:      item.partName    || '',
    spec:          item.spec        || null,
    brand:         item.brand       || null,
    qty:           toFloat(item.qty),
    uom:           item.uom         || '',
    rate:          toFloat(item.rate),
    amount:        toFloat(item.amount),
    source:        item.source      || null,
    sourceId:      item.sourceId ? toInt(item.sourceId) : null,
    heatTreatment: item.heatTreatment != null ? String(item.heatTreatment) : null,
    mGrade:        item.mGrade        != null ? String(item.mGrade)        : null,
    rework:        item.rework        != null ? String(item.rework)        : null,
    hrc:           item.hrc           != null ? String(item.hrc)           : null,
    weight:        item.weight        != null ? String(item.weight)        : null,
    details:       item.details       != null ? String(item.details)       : null,
    workType:      item.workType      != null ? String(item.workType)      : null,
  }));


export const getNextNo = async (req, res) => {
  try {
    const result = await DcModel.getNextDcNo(req.db);
    res.json({ success: true, ...result });
  } catch (err) {
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const {
      dcNo, financialYear, date, partyType, customerId, supplierId, partyName: rawPartyName,
      customerName, address, contPerson, contactNo, gstNo, dcType, vehicleNo, driverName,
      desThrough, termsOfDelivery, items, createdBy
    } = req.body;

    if (!dcNo) {
      throw new BadRequestError('dcNo is required');
    }
    if (!partyType || !['Customer', 'Supplier'].includes(partyType)) {
      throw new BadRequestError('partyType must be either Customer or Supplier');
    }
    
    const partyName = rawPartyName || customerName;
    if (!partyName) {
      throw new BadRequestError('partyName or customerName is required');
    }
    if (!dcType) {
      throw new BadRequestError('dcType is required');
    }

    const detailRows = buildDetailRows(items);
    
    // Auto-calculate totalQty and totalAmount
    const totalQty = detailRows.reduce((sum, item) => sum + item.qty, 0);
    const totalAmount = detailRows.reduce((sum, item) => sum + item.amount, 0);

    const auditUser = req.user?.username || createdBy || 'Admin';

    const headerData = {
      dcNo:            dcNo.trim(),
      financialYear:   financialYear || '',
      date:            date ? new Date(date) : new Date(),
      partyType,
      customerId:      customerId ? toInt(customerId) : null,
      supplierId:      supplierId ? toInt(supplierId) : null,
      partyName:       partyName.trim(),
      address:         address         || null,
      contPerson:      contPerson      || null,
      contactNo:       contactNo       || null,
      gstNo:           gstNo           || null,
      dcType:          dcType.trim(),
      vehicleNo:       vehicleNo       || null,
      driverName:      driverName      || null,
      desThrough:      desThrough      || null,
      termsOfDelivery: termsOfDelivery || null,
      totalQty,
      totalAmount,
      createdBy:       auditUser,
      updatedBy:       auditUser,
    };

    const record = await DcModel.createDeliveryChallan(req.db, headerData, detailRows);

    // Publish event
    eventBus.publish(SOCKET_EVENTS.DELIVERY_CHALLAN_CREATED, { data: record });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ConflictError('Delivery Challan number already exists');
    }
    if (err.code === 'P2003') {
      throw new BadRequestError('Invalid Customer or Supplier reference');
    }
    throw err;
  }
};

export const getRecentValues = async (req, res) => {
  try {
    const data = await DcModel.getRecentDcValues(req.db);
    res.json({ success: true, ...data });
  } catch (err) {
    throw err;
  }
};

export const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await DcModel.getAllDeliveryChallans(req.db, page, limit);
    res.json({ success: true, ...result });
  } catch (err) {
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      dcNo, financialYear, date, partyType, customerId, supplierId, partyName: rawPartyName,
      customerName, address, contPerson, contactNo, gstNo, dcType, vehicleNo, driverName,
      desThrough, termsOfDelivery, items
    } = req.body;

    const partyName = rawPartyName || customerName;
    const detailRows = buildDetailRows(items);
    const totalQty = detailRows.reduce((sum, item) => sum + item.qty, 0);
    const totalAmount = detailRows.reduce((sum, item) => sum + item.amount, 0);

    const auditUser = req.user?.username || 'Admin';

    const headerData = {
      dcNo:            dcNo.trim(),
      financialYear:   financialYear || '',
      date:            date ? new Date(date) : new Date(),
      partyType,
      customerId:      customerId ? toInt(customerId) : null,
      supplierId:      supplierId ? toInt(supplierId) : null,
      partyName:       partyName.trim(),
      address:         address         || null,
      contPerson:      contPerson      || null,
      contactNo:       contactNo       || null,
      gstNo:           gstNo           || null,
      dcType:          dcType.trim(),
      vehicleNo:       vehicleNo       || null,
      driverName:      driverName      || null,
      desThrough:      desThrough      || null,
      termsOfDelivery: termsOfDelivery || null,
      totalQty,
      totalAmount,
      updatedBy:       auditUser,
    };

    const record = await DcModel.updateDeliveryChallan(req.db, id, headerData, detailRows);
    res.json({ success: true, data: record });
  } catch (err) {
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const record = await DcModel.removeDeliveryChallan(req.db, id);
    if (!record) {
      throw new NotFoundError('Delivery Challan not found');
    }
    res.json({ success: true });
  } catch (err) {
    throw err;
  }
};

export const getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const record = await DcModel.getDeliveryChallanById(req.db, id);
    if (!record) {
      throw new NotFoundError('Delivery Challan not found');
    }
    res.json({ success: true, data: record });
  } catch (err) {
    throw err;
  }
};
