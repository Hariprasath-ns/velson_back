import * as POModel from '../models/purchaseMasterModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middlewares/customErrors.js";
import { eventBus } from '../services/eventBus.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';
import { getActorContext } from '../utils/actorContext.js';


export const getDistinctValues = async (req, res) => {
  try {
    const data = await POModel.getDistinctPOFieldValues(req.db)
    res.json({ success: true, data })
  } catch (err) {
    
    throw err;
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
    
    throw err;
  }
};

export const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await POModel.getAllPurchaseOrders(req.db, page, limit);
    res.json({ success: true, ...result });
  } catch (err) {
    
    throw err;
  }
};

export const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await POModel.getPurchaseOrderById(req.db, id);
    if (!data) throw new NotFoundError('Purchase order not found');
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
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
      throw new BadRequestError('poNo is required');
    }

    let finalSupplierRefNo = supplierRefNo || null;
    let finalContactPerson = contactPerson || null;
    let finalContactNumber = contactNumber || null;
    let finalSupplierAddress = supplierAddress || null;
    let finalGstNo = gstNo || null;

    if (!finalSupplierRefNo && supplierId) {
      const sup = await req.db.supplierMaster.findUnique({ where: { id: parseInt(supplierId, 10) }});
      if (sup) {
        finalSupplierRefNo = sup.sCode;
        finalContactPerson = finalContactPerson || sup.contactPerson || null;
        finalContactNumber = finalContactNumber || sup.mobile || sup.phone || null;
        finalSupplierAddress = finalSupplierAddress || sup.address || null;
        finalGstNo = finalGstNo || sup.gstNo || null;
      }
    } else if (finalSupplierRefNo) {
      const sup = await req.db.supplierMaster.findUnique({ where: { sCode: finalSupplierRefNo }});
      if (sup) {
        finalContactPerson = finalContactPerson || sup.contactPerson || null;
        finalContactNumber = finalContactNumber || sup.mobile || sup.phone || null;
        finalSupplierAddress = finalSupplierAddress || sup.address || null;
        finalGstNo = finalGstNo || sup.gstNo || null;
      }
    }

    const headerData = {
      poNo:           poNo.trim(),
      financialYear:  financialYear  || '',
      poDate:         poDate ? new Date(poDate) : new Date(),
      etaDate:        etaDate ? new Date(etaDate) : null,
      poType:         poType         || 'Purchase Order',

      contactPerson:  finalContactPerson,
      contactNumber:  finalContactNumber,
      supplierAddress: finalSupplierAddress,
      gstNo:          finalGstNo,
      supplierRefNo:  finalSupplierRefNo,
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

    const actorContext = await getActorContext(req);
    eventBus.publish(SOCKET_EVENTS.PURCHASE_ORDER_CREATED, {
      referenceId: record.id,
      referenceNumber: record.poNo,
      referenceType: "purchase-order",
      poNo: record.poNo,
      supplierName: record.supplier?.supplierName || record.supplierRefNo || "Supplier",
      userId: req.user?.id,
      actorContext
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ConflictError('Purchase order number already exists');
    }
    if (err.code === 'P2003') {
      throw new BadRequestError('Invalid supplier reference');
    }
    
    throw err;
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

    let finalSupplierRefNo = supplierRefNo || null;
    let finalContactPerson = contactPerson || null;
    let finalContactNumber = contactNumber || null;
    let finalSupplierAddress = supplierAddress || null;
    let finalGstNo = gstNo || null;

    if (!finalSupplierRefNo && supplierId) {
      const sup = await req.db.supplierMaster.findUnique({ where: { id: parseInt(supplierId, 10) }});
      if (sup) {
        finalSupplierRefNo = sup.sCode;
        finalContactPerson = finalContactPerson || sup.contactPerson || null;
        finalContactNumber = finalContactNumber || sup.mobile || sup.phone || null;
        finalSupplierAddress = finalSupplierAddress || sup.address || null;
        finalGstNo = finalGstNo || sup.gstNo || null;
      }
    } else if (finalSupplierRefNo) {
      const sup = await req.db.supplierMaster.findUnique({ where: { sCode: finalSupplierRefNo }});
      if (sup) {
        finalContactPerson = finalContactPerson || sup.contactPerson || null;
        finalContactNumber = finalContactNumber || sup.mobile || sup.phone || null;
        finalSupplierAddress = finalSupplierAddress || sup.address || null;
        finalGstNo = finalGstNo || sup.gstNo || null;
      }
    }

    const headerData = {
      poDate:         poDate ? new Date(poDate) : new Date(),
      etaDate:        etaDate ? new Date(etaDate) : null,
      poType:         poType         || 'Purchase Order',

      contactPerson:  finalContactPerson,
      contactNumber:  finalContactNumber,
      supplierAddress: finalSupplierAddress,
      gstNo:          finalGstNo,
      supplierRefNo:  finalSupplierRefNo,
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

    const original = await POModel.getPurchaseOrderById(req.db, id);
    const record = await POModel.updatePurchaseOrder(req.db, id, headerData, buildDetailRows(items));

    const actorContext = await getActorContext(req);
    if (original && original.status !== record.status && record.status === 'Approved') {
      eventBus.publish(SOCKET_EVENTS.PURCHASE_ORDER_APPROVED, {
        referenceId: record.id,
        referenceNumber: record.poNo,
        referenceType: "purchase-order",
        poNo: record.poNo,
        approvedBy: record.updatedBy || "Admin",
        userId: req.user?.id,
        actorContext
      });
    }

    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Purchase order not found');
    }
    
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await POModel.deletePurchaseOrder(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Purchase order not found');
    }
    
    throw err;
  }
};
