import * as GRNModel from '../models/grnMasterModel.js';

const toFloat = (v) => (v !== '' && v != null ? parseFloat(v) || 0 : 0);

const buildDetailRows = (items = []) =>
  items.map((item) => ({
    itemCode:       item.itemCode       || null,
    itemName:       item.itemName       || null,
    supplierPartNo: item.supplierPartNo || null,
    description:    item.description    || null,
    hsnCode:        item.hsnCode        || null,
    unit:           item.unit           || null,
    stockQty:       toFloat(item.stockQty),
    orderQty:       toFloat(item.orderQty),
    qty:            toFloat(item.qty),
    unitPrice:      toFloat(item.unitPrice),
    total:          toFloat(item.total),
    discPer:        toFloat(item.discPer),
    discAmt:        toFloat(item.discAmt),
    finalPrice:     toFloat(item.finalPrice),
    taxPer:         toFloat(item.taxPer),
    netAmt:         toFloat(item.netAmt),
  }));

export const getNextNo = async (req, res) => {
  try {
    const result = await GRNModel.getNextGRNNo(req.db);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[grnMaster] getNextNo error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const data = await GRNModel.getAllGRNEntries(req.db);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[grnMaster] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await GRNModel.getGRNEntryById(req.db, id);
    if (!data) return res.status(404).json({ success: false, message: 'GRN entry not found' });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[grnMaster] getOne error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const {
      grnNo, financialYear, grnDate, grnType, gateEntryNo,
      supplierName, contactPerson, contactNo,
      purchaseLedger, purchaseType, currency, currencyType,
      poNo, poDate, taxType, exchangeRate,
      invoiceNo, invoiceDate, qcType, discountType,
      remarks, currencyTotal, roundOff, freightLedger, tcsLedger,
      subTotal, totalAmount, status, createdBy, items,
    } = req.body;

    if (!grnNo) {
      return res.status(400).json({ success: false, message: 'grnNo is required' });
    }

    const headerData = {
      grnNo:          grnNo.trim(),
      financialYear:  financialYear   || '',
      grnDate:        grnDate ? new Date(grnDate) : new Date(),
      grnType:        grnType         || null,
      gateEntryNo:    gateEntryNo     || null,
      supplierName:   supplierName    || null,
      contactPerson:  contactPerson   || null,
      contactNo:      contactNo       || null,
      purchaseLedger: purchaseLedger  || null,
      purchaseType:   purchaseType    || null,
      currency:       currency        || null,
      currencyType:   currencyType    || null,
      poNo:           poNo            || null,
      poDate:         poDate ? new Date(poDate) : null,
      taxType:        taxType         || null,
      exchangeRate:   toFloat(exchangeRate),
      invoiceNo:      invoiceNo       || null,
      invoiceDate:    invoiceDate ? new Date(invoiceDate) : null,
      qcType:         qcType          || null,
      discountType:   discountType    || 'Dis_Per',
      remarks:        remarks         || null,
      currencyTotal:  toFloat(currencyTotal),
      roundOff:       toFloat(roundOff),
      freightLedger:  freightLedger   || null,
      tcsLedger:      tcsLedger       || null,
      subTotal:       toFloat(subTotal),
      totalAmount:    toFloat(totalAmount),
      status:         status          || 'Open',
      createdBy:      createdBy       || 'Admin',
      updatedBy:      createdBy       || 'Admin',
    };

    const record = await GRNModel.createGRNEntry(req.db, headerData, buildDetailRows(items));
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'GRN number already exists' });
    }
    console.error('[grnMaster] create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      grnDate, grnType, gateEntryNo,
      supplierName, contactPerson, contactNo,
      purchaseLedger, purchaseType, currency, currencyType,
      poNo, poDate, taxType, exchangeRate,
      invoiceNo, invoiceDate, qcType, discountType,
      remarks, currencyTotal, roundOff, freightLedger, tcsLedger,
      subTotal, totalAmount, status, updatedBy, items,
    } = req.body;

    const headerData = {
      grnDate:        grnDate ? new Date(grnDate) : new Date(),
      grnType:        grnType         || null,
      gateEntryNo:    gateEntryNo     || null,
      supplierName:   supplierName    || null,
      contactPerson:  contactPerson   || null,
      contactNo:      contactNo       || null,
      purchaseLedger: purchaseLedger  || null,
      purchaseType:   purchaseType    || null,
      currency:       currency        || null,
      currencyType:   currencyType    || null,
      poNo:           poNo            || null,
      poDate:         poDate ? new Date(poDate) : null,
      taxType:        taxType         || null,
      exchangeRate:   toFloat(exchangeRate),
      invoiceNo:      invoiceNo       || null,
      invoiceDate:    invoiceDate ? new Date(invoiceDate) : null,
      qcType:         qcType          || null,
      discountType:   discountType    || 'Dis_Per',
      remarks:        remarks         || null,
      currencyTotal:  toFloat(currencyTotal),
      roundOff:       toFloat(roundOff),
      freightLedger:  freightLedger   || null,
      tcsLedger:      tcsLedger       || null,
      subTotal:       toFloat(subTotal),
      totalAmount:    toFloat(totalAmount),
      status:         status          || 'Open',
      updatedBy:      updatedBy       || 'Admin',
    };

    const record = await GRNModel.updateGRNEntry(req.db, id, headerData, buildDetailRows(items));
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'GRN entry not found' });
    }
    console.error('[grnMaster] update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await GRNModel.deleteGRNEntry(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'GRN entry not found' });
    }
    console.error('[grnMaster] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
