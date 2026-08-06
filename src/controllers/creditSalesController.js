import * as CreditSalesModel from '../models/creditSalesModel.js';
import { BadRequestError, NotFoundError, ConflictError } from '../middlewares/customErrors.js';

const toFloat = (v) => (v !== '' && v != null ? parseFloat(v) || 0 : 0);
const toInt   = (v) => (v !== '' && v != null ? parseInt(v, 10) || null : null);
const toBool  = (v) => (typeof v === 'boolean' ? v : v === 'true');

const buildDetailRows = (details = []) =>
  details.map((row) => ({
    slNo:          toInt(row.slNo) || 1,
    barcode:       row.barcode     || null,
    partNo:        row.partNo      || '',
    partName:      row.partName    || '',
    specification: row.specification || null,
    brand:         row.brand       || null,
    uom:           row.uom         || 'PCS',
    qty:           toFloat(row.qty),
    rate:          toFloat(row.rate),
    grossAmt:      toFloat(row.grossAmt),
    discAmt:       toFloat(row.discAmt),
    taxable:       toFloat(row.taxable),
    taxPercent:    toFloat(row.taxPercent),
    netRate:       toFloat(row.netRate),
    netAmt:        toFloat(row.netAmt),
    isManual:      toBool(row.isManual)
  }));

export const getNextNo = async (req, res) => {
  try {
    const result = await CreditSalesModel.getNextCreditSalesBillNo(req.db);
    res.json({ success: true, ...result });
  } catch (err) {
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const {
      billNo, billDate, salesAc, mode, dcNo, dcDate, partyName, address,
      taxType, deliveryPlace, deliveryTo, stockReduce, transport, remarks,
      totals, details, createdBy
    } = req.body;

    if (!billNo) {
      throw new BadRequestError('billNo is required');
    }
    if (!partyName) {
      throw new BadRequestError('partyName is required');
    }

    const detailRows = buildDetailRows(details);

    // Calculate totals automatically from detailRows if not provided or to ensure validity
    const totalQty = detailRows.reduce((sum, item) => sum + item.qty, 0);
    const grossAmt = detailRows.reduce((sum, item) => sum + item.grossAmt, 0);
    const discAmt = detailRows.reduce((sum, item) => sum + item.discAmt, 0);
    const taxableAmt = detailRows.reduce((sum, item) => sum + item.taxable, 0);
    const cgst = totals?.cgst != null ? toFloat(totals.cgst) : 0;
    const sgst = totals?.sgst != null ? toFloat(totals.sgst) : 0;
    const igst = totals?.igst != null ? toFloat(totals.igst) : 0;
    const totalTax = cgst + sgst + igst;
    const netAmt = taxableAmt + totalTax;

    const auditUser = req.user?.username || createdBy || 'Admin';

    const headerData = {
      billNo:        billNo.trim(),
      billDate:      billDate ? new Date(billDate) : new Date(),
      salesAc:       salesAc || 'Sales A/C',
      mode:          mode || 'CREDIT',
      dcNo:          dcNo || null,
      dcDate:        dcDate ? new Date(dcDate) : null,
      partyName:     partyName.trim(),
      address:       address || null,
      taxType:       taxType || 'Local',
      deliveryPlace: deliveryPlace || null,
      deliveryTo:    deliveryTo || null,
      stockReduce:   stockReduce || 'No',
      transport:     transport || null,
      remarks:       remarks || null,
      totalQty,
      grossAmt,
      discAmt,
      taxableAmt,
      cgst,
      sgst,
      igst,
      totalTax,
      netAmt,
      createdBy:     auditUser,
      updatedBy:     auditUser
    };

    const record = await CreditSalesModel.createCreditSale(req.db, headerData, detailRows);

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ConflictError('Invoice Bill Number already exists');
    }
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new BadRequestError('Invalid Credit Sale ID');
    }

    const {
      billNo, billDate, salesAc, mode, dcNo, dcDate, partyName, address,
      taxType, deliveryPlace, deliveryTo, stockReduce, transport, remarks,
      totals, details, updatedBy
    } = req.body;

    const existing = await CreditSalesModel.getCreditSaleById(req.db, id);
    if (!existing) {
      throw new NotFoundError('Credit Sale invoice not found');
    }

    const detailRows = buildDetailRows(details);

    // Calculate totals automatically from detailRows
    const totalQty = detailRows.reduce((sum, item) => sum + item.qty, 0);
    const grossAmt = detailRows.reduce((sum, item) => sum + item.grossAmt, 0);
    const discAmt = detailRows.reduce((sum, item) => sum + item.discAmt, 0);
    const taxableAmt = detailRows.reduce((sum, item) => sum + item.taxable, 0);
    const cgst = totals?.cgst != null ? toFloat(totals.cgst) : 0;
    const sgst = totals?.sgst != null ? toFloat(totals.sgst) : 0;
    const igst = totals?.igst != null ? toFloat(totals.igst) : 0;
    const totalTax = cgst + sgst + igst;
    const netAmt = taxableAmt + totalTax;

    const auditUser = req.user?.username || updatedBy || 'Admin';

    const headerData = {
      billNo:        billNo ? billNo.trim() : existing.billNo,
      billDate:      billDate ? new Date(billDate) : existing.billDate,
      salesAc:       salesAc || existing.salesAc,
      mode:          mode || existing.mode,
      dcNo:          dcNo || null,
      dcDate:        dcDate ? new Date(dcDate) : null,
      partyName:     partyName ? partyName.trim() : existing.partyName,
      address:       address !== undefined ? address : existing.address,
      taxType:       taxType || existing.taxType,
      deliveryPlace: deliveryPlace !== undefined ? deliveryPlace : existing.deliveryPlace,
      deliveryTo:    deliveryTo !== undefined ? deliveryTo : existing.deliveryTo,
      stockReduce:   stockReduce || existing.stockReduce,
      transport:     transport !== undefined ? transport : existing.transport,
      remarks:       remarks !== undefined ? remarks : existing.remarks,
      totalQty,
      grossAmt,
      discAmt,
      taxableAmt,
      cgst,
      sgst,
      igst,
      totalTax,
      netAmt,
      updatedBy:     auditUser
    };

    const record = await CreditSalesModel.updateCreditSale(req.db, id, headerData, detailRows);

    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ConflictError('Invoice Bill Number already exists');
    }
    throw err;
  }
};

export const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await CreditSalesModel.getAllCreditSales(req.db, page, limit);
    res.json({ success: true, ...result });
  } catch (err) {
    throw err;
  }
};

export const getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new BadRequestError('Invalid Credit Sale ID');
    }
    const record = await CreditSalesModel.getCreditSaleById(req.db, id);
    if (!record) {
      throw new NotFoundError('Credit Sale invoice not found');
    }
    res.json({ success: true, data: record });
  } catch (err) {
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new BadRequestError('Invalid Credit Sale ID');
    }
    await CreditSalesModel.deleteCreditSale(req.db, id);
    res.json({ success: true });
  } catch (err) {
    throw err;
  }
};
