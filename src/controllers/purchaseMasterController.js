import * as POModel from '../models/purchaseMasterModel.js';

export const getDistinctValues = async (req, res) => {
  try {
    const data = await POModel.getDistinctPOFieldValues(req.db)
    res.json({ success: true, data })
  } catch (err) {
    console.error('[purchaseMaster] getDistinctValues error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
};

const toFloat = (v) => (v !== '' && v != null ? parseFloat(v) || 0 : 0);

const buildDetailRows = (items = []) =>
  items.map((item) => ({
    itemId:         item.itemId ? parseInt(item.itemId, 10) : null,
    purchaseReqNo:  item.purchaseReqNo  || null,
    supplierPartNo: item.supplierPartNo || null,
    itemCode:       item.itemCode       || null,
    itemName:       item.itemName       || null,
    description:    item.description    || null,
    hsnCode:        item.hsnCode        || null,
    uom:            item.uom            || null,
    qty:            toFloat(item.qty),
    unitPrice:      toFloat(item.unitPrice),
    discPer:        toFloat(item.discPer),
    discAmt:        toFloat(item.discAmt),
    amount:         toFloat(item.amount),
    gstPer:         toFloat(item.gstPer),
    gstAmt:         toFloat(item.gstAmt),
    netAmt:         toFloat(item.netAmt),
  }));

export const getNextNo = async (req, res) => {
  try {
    const result = await POModel.getNextPoNo(req.db);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[purchaseMaster] getNextNo error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const data = await POModel.getAllPurchaseOrders(req.db);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[purchaseMaster] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await POModel.getPurchaseOrderById(req.db, id);
    if (!data) return res.status(404).json({ success: false, message: 'Purchase order not found' });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[purchaseMaster] getOne error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const {
      poNo, financialYear, poDate, etaDate, poType,
      supplierId, contactPerson, contactNumber, supplierAddress, gstNo, supplierRefNo,
      discountType, freight, destination, paymentTerms, testReport,
      project, modeOfDespatch, deliveryPeriod, taxTerms, warrantyTerms,
      discountTerms, remarks,
      subTotal, cgstPer, cgstAmt, sgstPer, sgstAmt,
      igstPer, igstAmt, othersPer, othersAmt, totalAmount,
      status, createdBy, items,
    } = req.body;

    if (!poNo) {
      return res.status(400).json({ success: false, message: 'poNo is required' });
    }

    const headerData = {
      poNo:           poNo.trim(),
      financialYear:  financialYear  || '',
      poDate:         poDate ? new Date(poDate) : new Date(),
      etaDate:        etaDate ? new Date(etaDate) : null,
      poType:         poType         || 'Purchase Order',
      supplierId:     supplierId ? parseInt(supplierId, 10) : null,
      contactPerson:  contactPerson  || null,
      contactNumber:  contactNumber  || null,
      supplierAddress: supplierAddress || null,
      gstNo:          gstNo          || null,
      supplierRefNo:  supplierRefNo  || null,
      discountType:   discountType   || 'Dis_Per',
      freight:        toFloat(freight),
      destination:    destination    || null,
      paymentTerms:   paymentTerms   || null,
      testReport:     testReport     || null,
      project:        project        || null,
      modeOfDespatch: modeOfDespatch || null,
      deliveryPeriod: deliveryPeriod || null,
      taxTerms:       taxTerms       || null,
      warrantyTerms:  warrantyTerms  || null,
      discountTerms:  discountTerms  || null,
      remarks:        remarks        || null,
      subTotal:       toFloat(subTotal),
      cgstPer:        toFloat(cgstPer),
      cgstAmt:        toFloat(cgstAmt),
      sgstPer:        toFloat(sgstPer),
      sgstAmt:        toFloat(sgstAmt),
      igstPer:        toFloat(igstPer),
      igstAmt:        toFloat(igstAmt),
      othersPer:      toFloat(othersPer),
      othersAmt:      toFloat(othersAmt),
      totalAmount:    toFloat(totalAmount),
      status:         status         || 'Draft',
      createdBy:      createdBy      || 'Admin',
      updatedBy:      createdBy      || 'Admin',
    };

    const record = await POModel.createPurchaseOrder(req.db, headerData, buildDetailRows(items));
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Purchase order number already exists' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ success: false, message: 'Invalid supplier reference' });
    }
    console.error('[purchaseMaster] create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      poDate, etaDate, poType,
      supplierId, contactPerson, contactNumber, supplierAddress, gstNo, supplierRefNo,
      discountType, freight, destination, paymentTerms, testReport,
      project, modeOfDespatch, deliveryPeriod, taxTerms, warrantyTerms,
      discountTerms, remarks,
      subTotal, cgstPer, cgstAmt, sgstPer, sgstAmt,
      igstPer, igstAmt, othersPer, othersAmt, totalAmount,
      status, updatedBy, items,
    } = req.body;

    const headerData = {
      poDate:         poDate ? new Date(poDate) : new Date(),
      etaDate:        etaDate ? new Date(etaDate) : null,
      poType:         poType         || 'Purchase Order',
      supplier:       supplierId ? { connect: { id: parseInt(supplierId, 10) } } : { disconnect: true },
      contactPerson:  contactPerson  || null,
      contactNumber:  contactNumber  || null,
      supplierAddress: supplierAddress || null,
      gstNo:          gstNo          || null,
      supplierRefNo:  supplierRefNo  || null,
      discountType:   discountType   || 'Dis_Per',
      freight:        toFloat(freight),
      destination:    destination    || null,
      paymentTerms:   paymentTerms   || null,
      testReport:     testReport     || null,
      project:        project        || null,
      modeOfDespatch: modeOfDespatch || null,
      deliveryPeriod: deliveryPeriod || null,
      taxTerms:       taxTerms       || null,
      warrantyTerms:  warrantyTerms  || null,
      discountTerms:  discountTerms  || null,
      remarks:        remarks        || null,
      subTotal:       toFloat(subTotal),
      cgstPer:        toFloat(cgstPer),
      cgstAmt:        toFloat(cgstAmt),
      sgstPer:        toFloat(sgstPer),
      sgstAmt:        toFloat(sgstAmt),
      igstPer:        toFloat(igstPer),
      igstAmt:        toFloat(igstAmt),
      othersPer:      toFloat(othersPer),
      othersAmt:      toFloat(othersAmt),
      totalAmount:    toFloat(totalAmount),
      status:         status         || 'Draft',
      updatedBy:      updatedBy      || 'Admin',
    };

    const record = await POModel.updatePurchaseOrder(req.db, id, headerData, buildDetailRows(items));
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }
    console.error('[purchaseMaster] update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await POModel.deletePurchaseOrder(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }
    console.error('[purchaseMaster] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
