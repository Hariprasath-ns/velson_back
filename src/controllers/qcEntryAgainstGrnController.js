import * as Model from '../models/qcEntryAgainstGrnModel.js';
import { BadRequestError, NotFoundError } from '../middlewares/customErrors.js';
import { eventBus } from '../services/eventBus.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';

export const getAll = async (req, res) => {
  try {
    const { search = '', grnNo = '', approvalStatus = '' } = req.query;
    const data = await Model.getAll(req.db, { search, grnNo, approvalStatus });
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

export const getGrnOptions = async (req, res) => {
  try {
    const data = await Model.getGrnWithQualityItems(req.db);
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

export const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await Model.getById(req.db, id);
    if (!data) throw new NotFoundError('QC Entry record not found');
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const grnNo = req.body.grnNo?.trim();
    const itemCode = (req.body.itemCode || '').trim();
    const itemName = req.body.itemName?.trim();

    if (!grnNo) {
      throw new BadRequestError('GRN No is required');
    }
    if (!itemCode) {
      throw new BadRequestError('Part Number (Item Code) is required');
    }

    // Check uniqueness: by GRN No + Barcode if barcode present, else by GRN No + Part Number
    const barcode = (req.body.barcode || '').trim();
    if (barcode) {
      const existing = await req.db.qCEntryAgainstGRN.findFirst({
        where: {
          grnNo: { equals: grnNo, mode: 'insensitive' },
          barcode: { equals: barcode, mode: 'insensitive' },
        },
      });
      if (existing) {
        throw new BadRequestError(
          `QC Entry already exists for GRN "${grnNo}" and Barcode "${barcode}" (QC No: ${existing.qcNo || existing.id}). Barcode can only be inspected once.`
        );
      }
    } else {
      const existing = await req.db.qCEntryAgainstGRN.findFirst({
        where: {
          grnNo: { equals: grnNo, mode: 'insensitive' },
          itemCode: { equals: itemCode, mode: 'insensitive' },
          OR: [
            { barcode: null },
            { barcode: '' }
          ]
        },
      });
      if (existing) {
        throw new BadRequestError(
          `QC Entry already exists for GRN "${grnNo}" and Part Number "${itemCode}" (QC No: ${existing.qcNo || existing.id}).`
        );
      }
    }

    const grnQty = Number(req.body.grnQty) || 0;
    const acceptedQty = Number(req.body.acceptedQty) || 0;
    const rejectedQty = Number(req.body.rejectedQty) || 0;
    const reworkQty = Number(req.body.reworkQty) || 0;

    // The sum of approval qty, rejected qty, and rework qty must be equal to GRN qty
    if (acceptedQty + rejectedQty + reworkQty !== grnQty) {
      throw new BadRequestError(
        `The sum of Approval (${acceptedQty}), Rejected (${rejectedQty}), and Rework (${reworkQty}) quantities (${acceptedQty + rejectedQty + reworkQty}) must be equal to GRN Qty (${grnQty}).`
      );
    }

    let qcStatus = (req.body.qcStatus || 'QC OK').trim();
    if (acceptedQty > 0 && (rejectedQty > 0 || reworkQty > 0)) {
      qcStatus = 'QC Partially Approved';
    } else if (acceptedQty === grnQty && rejectedQty === 0 && reworkQty === 0 && grnQty > 0 && !req.body.qcStatus) {
      qcStatus = 'QC OK';
    }

    const isQcOk = qcStatus.toUpperCase() === 'QC OK';
    // When QC Status is QC OK, directly approve and add to stock (no need for QC Approval).
    // For all other statuses, set Pending Approval so it goes to QC Approval.
    const approvalStatus = isQcOk ? 'Approved' : 'Pending Approval';

    let qcNo = req.body.qcNo?.trim();
    if (!qcNo) {
      const maxRow = await req.db.qCEntryAgainstGRN.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true }
      });
      const nextId = (maxRow?.id || 0) + 1;
      qcNo = `QC-GRN-${String(nextId).padStart(4, '0')}`;
    }

    const data = {
      qcNo,
      qcDate: req.body.qcDate ? new Date(req.body.qcDate) : new Date(),
      grnNo,
      grnDate: req.body.grnDate || null,
      grnType: req.body.grnType || null,
      invoiceNo: req.body.invoiceNo || null,
      invoiceDate: req.body.invoiceDate || null,
      supplierName: req.body.supplierName || null,
      supplierAddress: req.body.supplierAddress || null,
      itemCode,
      itemName: itemName || null,
      uom: req.body.uom || null,
      grnQty,
      acceptedQty,
      rejectedQty,
      reworkQty,
      qcStatus,
      approvalStatus,
      remarks: req.body.remarks || null,
      barcode: req.body.barcode || null,
      inspectedBy: req.body.inspectedBy || 'Quality Inspector',
      inspectionParameters: req.body.inspectionParameters || null,
    };

    const record = await Model.create(req.db, data);

    // Only sync directly to stock when QC Status is QC OK (or already Approved).
    // Non-OK statuses wait for QC Approval before any accepted stock is added.
    if (isQcOk || approvalStatus === 'Approved') {
      await syncQcApprovedStock(req.db, {
        grnNo,
        itemCode,
        barcode: record.barcode,
        acceptedQty,
        grnDate: data.grnDate,
        inspectedBy: data.inspectedBy,
        uom: data.uom,
        qcNo: record.qcNo,
      });
    }

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new BadRequestError('QC Entry already exists for this GRN Number and Part Number combination. GRN Number and Part Number must be unique.');
    }
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await Model.getById(req.db, id);
    if (!existing) throw new NotFoundError('QC Entry record not found');

    const newGrnNo = (req.body.grnNo !== undefined ? req.body.grnNo : existing.grnNo)?.trim();
    const newItemCode = (req.body.itemCode !== undefined ? req.body.itemCode : existing.itemCode)?.trim();

    const newBarcode = (req.body.barcode !== undefined ? req.body.barcode : existing.barcode)?.trim();

    if (newGrnNo && newBarcode) {
      const duplicate = await req.db.qCEntryAgainstGRN.findFirst({
        where: {
          id: { not: id },
          grnNo: { equals: newGrnNo, mode: 'insensitive' },
          barcode: { equals: newBarcode, mode: 'insensitive' },
        },
      });
      if (duplicate) {
        throw new BadRequestError(
          `Another QC Entry already exists for GRN "${newGrnNo}" and Barcode "${newBarcode}" (QC No: ${duplicate.qcNo || duplicate.id}).`
        );
      }
    } else if (newGrnNo && newItemCode) {
      const duplicate = await req.db.qCEntryAgainstGRN.findFirst({
        where: {
          id: { not: id },
          grnNo: { equals: newGrnNo, mode: 'insensitive' },
          itemCode: { equals: newItemCode, mode: 'insensitive' },
          OR: [
            { barcode: null },
            { barcode: '' }
          ]
        },
      });
      if (duplicate) {
        throw new BadRequestError(
          `Another QC Entry already exists for GRN "${newGrnNo}" and Part Number "${newItemCode}" (QC No: ${duplicate.qcNo || duplicate.id}).`
        );
      }
    }

    const grnQty = req.body.grnQty != null ? Number(req.body.grnQty) : existing.grnQty;
    const acceptedQty = req.body.acceptedQty != null ? Number(req.body.acceptedQty) : existing.acceptedQty;
    const rejectedQty = req.body.rejectedQty != null ? Number(req.body.rejectedQty) : existing.rejectedQty;
    const reworkQty = req.body.reworkQty != null ? Number(req.body.reworkQty) : existing.reworkQty;

    // The sum of approval qty, rejected qty, and rework qty must be equal to GRN qty
    if (acceptedQty + rejectedQty + reworkQty !== grnQty) {
      throw new BadRequestError(
        `The sum of Approval, Rejected, and Rework quantities must be equal to GRN Qty (${grnQty}).`
      );
    }

    let qcStatus = req.body.qcStatus ?? existing.qcStatus;
    if (acceptedQty > 0 && (rejectedQty > 0 || reworkQty > 0)) {
      qcStatus = 'QC Partially Approved';
    } else if (acceptedQty === grnQty && rejectedQty === 0 && reworkQty === 0 && grnQty > 0 && !req.body.qcStatus) {
      qcStatus = 'QC OK';
    }

    const isQcOk = (qcStatus || '').trim().toUpperCase() === 'QC OK';
    const defaultAppStatus = isQcOk ? 'Approved' : 'Pending Approval';
    const resolvedApprovalStatus = isQcOk
      ? 'Approved'
      : (req.body.approvalStatus ?? existing.approvalStatus ?? defaultAppStatus);

    const data = {
      qcDate: req.body.qcDate ? new Date(req.body.qcDate) : existing.qcDate,
      grnNo: newGrnNo || existing.grnNo,
      grnDate: req.body.grnDate ?? existing.grnDate,
      grnType: req.body.grnType ?? existing.grnType,
      invoiceNo: req.body.invoiceNo ?? existing.invoiceNo,
      invoiceDate: req.body.invoiceDate ?? existing.invoiceDate,
      supplierName: req.body.supplierName ?? existing.supplierName,
      supplierAddress: req.body.supplierAddress ?? existing.supplierAddress,
      itemCode: newItemCode ?? existing.itemCode,
      itemName: req.body.itemName ?? existing.itemName,
      uom: req.body.uom ?? existing.uom,
      grnQty,
      acceptedQty,
      rejectedQty,
      reworkQty,
      qcStatus,
      approvalStatus: resolvedApprovalStatus,
      remarks: req.body.remarks ?? existing.remarks,
      barcode: req.body.barcode ?? existing.barcode,
      inspectedBy: req.body.inspectedBy ?? existing.inspectedBy,
      inspectionParameters: req.body.inspectionParameters ?? existing.inspectionParameters,
    };

    const record = await Model.update(req.db, id, data);

    const appNorm = (record.approvalStatus || '').trim().toLowerCase();
    if (isQcOk || appNorm === 'approved' || appNorm === 'nc approved') {
      // Sync approved quantity into stock tables (gRNDetail.stockQty, stockAdjustment, stock_liability_1)
      await syncQcApprovedStock(req.db, {
        grnNo: record.grnNo,
        itemCode: record.itemCode,
        barcode: record.barcode,
        acceptedQty: record.acceptedQty,
        grnDate: record.grnDate,
        inspectedBy: record.inspectedBy,
        uom: record.uom,
        qcNo: record.qcNo,
      });
    }

    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new BadRequestError('QC Entry already exists for this GRN Number and Part Number combination. GRN Number and Part Number must be unique.');
    }
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await Model.getById(req.db, id);
    if (existing) {
      // Remove stock entry associated with this QC record
      await syncQcApprovedStock(req.db, {
        grnNo: existing.grnNo,
        itemCode: existing.itemCode,
        barcode: existing.barcode,
        acceptedQty: 0,
        qcNo: existing.qcNo,
      });
    }
    await Model.remove(req.db, id);
    res.json({ success: true, message: 'QC Entry deleted successfully' });
  } catch (err) {
    throw err;
  }
};

/**
 * Approve an existing QC Entry record by ID and sync approved quantity to stock tables
 */
export const approve = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await Model.getById(req.db, id);
    if (!existing) throw new NotFoundError('QC Entry record not found');

    const acceptedQty = req.body.acceptedQty !== undefined
      ? Number(req.body.acceptedQty)
      : (existing.acceptedQty > 0 ? existing.acceptedQty : existing.grnQty);

    const inspectionParameters = req.body.inspectionParameters !== undefined
      ? req.body.inspectionParameters
      : existing.inspectionParameters;

    const approvedBy = req.body.approvedBy || req.user?.name || 'Administrator';

    const updatedData = {
      approvalStatus: 'Approved',
      qcStatus: req.body.qcStatus || existing.qcStatus || 'QC OK',
      acceptedQty,
      inspectionParameters,
      remarks: req.body.remarks !== undefined ? req.body.remarks : existing.remarks,
    };

    const record = await Model.update(req.db, id, updatedData);

    // Sync approved quantity into stock tables (gRNDetail.stockQty, stockAdjustment, stock_liability_1)
    await syncQcApprovedStock(req.db, {
      grnNo: record.grnNo,
      itemCode: record.itemCode,
      barcode: record.barcode,
      acceptedQty: record.acceptedQty,
      grnDate: record.grnDate,
      inspectedBy: approvedBy,
      uom: record.uom,
      qcNo: record.qcNo,
    });

    res.json({
      success: true,
      message: `Part Number ${record.itemCode} approved successfully and added to the stock table.`,
      data: record,
    });
  } catch (err) {
    throw err;
  }
};

/**
 * Direct approval by GRN No & Part Number:
 * If record exists, update to Approved and sync stock.
 * If record does not exist, create new QC entry with Approved status and sync stock.
 */
export const approveDirect = async (req, res) => {
  try {
    const grnNo = req.body.grnNo?.trim();
    const itemCode = (req.body.itemCode || '').trim();
    if (!grnNo) throw new BadRequestError('GRN No is required');
    if (!itemCode) throw new BadRequestError('Part Number is required');

    const existing = await req.db.qCEntryAgainstGRN.findFirst({
      where: {
        grnNo: { equals: grnNo, mode: 'insensitive' },
        itemCode: { equals: itemCode, mode: 'insensitive' },
      },
    });

    const approvedBy = req.body.approvedBy || req.user?.name || 'Administrator';
    const inspectionParameters = req.body.inspectionParameters || [];

    const grnDetail = await req.db.gRNDetail.findFirst({
      where: {
        grn: { grnNo: { equals: grnNo, mode: 'insensitive' } },
        itemCode: { equals: itemCode, mode: 'insensitive' }
      },
      include: { grn: true }
    });

    const grnQty = grnDetail ? Number(grnDetail.receivedQty || grnDetail.billQty || 0) : Number(req.body.grnQty || 0);
    const acceptedQty = req.body.acceptedQty !== undefined ? Number(req.body.acceptedQty) : (grnQty || 1);

    let record;
    if (existing) {
      record = await Model.update(req.db, existing.id, {
        approvalStatus: 'Approved',
        qcStatus: req.body.qcStatus || existing.qcStatus || 'QC OK',
        acceptedQty: acceptedQty || existing.acceptedQty || grnQty,
        inspectionParameters: inspectionParameters.length ? inspectionParameters : existing.inspectionParameters,
        remarks: req.body.remarks !== undefined ? req.body.remarks : existing.remarks,
      });
    } else {
      const maxRow = await req.db.qCEntryAgainstGRN.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true }
      });
      const nextId = (maxRow?.id || 0) + 1;
      const qcNo = `QC-GRN-${String(nextId).padStart(4, '0')}`;

      record = await Model.create(req.db, {
        qcNo,
        qcDate: new Date(),
        grnNo,
        grnDate: grnDetail?.grn?.grnDate || null,
        grnType: grnDetail?.grn?.grnType || null,
        invoiceNo: grnDetail?.grn?.invoiceNo || null,
        invoiceDate: grnDetail?.grn?.invoiceDate || null,
        supplierName: grnDetail?.grn?.supplierName || null,
        supplierAddress: grnDetail?.grn?.supplierAddress || null,
        itemCode,
        itemName: grnDetail?.itemName || req.body.itemName || null,
        uom: grnDetail?.unit || req.body.uom || null,
        grnQty: grnQty || acceptedQty,
        acceptedQty,
        rejectedQty: Number(req.body.rejectedQty) || 0,
        reworkQty: Number(req.body.reworkQty) || 0,
        qcStatus: req.body.qcStatus || 'QC OK',
        approvalStatus: 'Approved',
        remarks: req.body.remarks || null,
        barcode: grnDetail?.barcode || req.body.barcode || null,
        inspectedBy: approvedBy,
        inspectionParameters,
      });
    }

    // Sync approved quantity into stock tables (gRNDetail.stockQty, stockAdjustment, stock_liability_1)
    await syncQcApprovedStock(req.db, {
      grnNo: record.grnNo,
      itemCode: record.itemCode,
      barcode: record.barcode,
      acceptedQty: record.acceptedQty,
      grnDate: record.grnDate,
      inspectedBy: approvedBy,
      uom: record.uom,
      qcNo: record.qcNo,
    });

    res.json({
      success: true,
      message: `Part Number ${record.itemCode} approved successfully and added to the stock table.`,
      data: record,
    });
  } catch (err) {
    throw err;
  }
};

/**
 * Synchronize QC approved quantity to Stock tables:
 * 1. Updates stockQty on gRNDetail (so Material Issue, Delivery Challan, etc. see available stock)
 * 2. Creates/updates stockAdjustment record (inward adjustment with barcode and voucher_no)
 * 3. Inserts into stock_liability_1 (inward ledger record with barcode, voucher_no, credit_amt, etc.)
 * 4. Publishes real-time socket events for stock updates
 */
async function syncQcApprovedStock(db, { grnNo, itemCode, barcode, acceptedQty, grnDate, inspectedBy, uom, qcNo }) {
  if (!grnNo || !itemCode) return;

  const partNo = itemCode.trim();
  const bc = barcode ? String(barcode).trim() : null;
  const qty = Number(acceptedQty || 0);

  // 1. Fetch GRNDetail matching grnNo and partNo (and barcode if present)
  let grnDetail = null;
  try {
    if (bc) {
      grnDetail = await db.gRNDetail.findFirst({
        where: {
          grn: { grnNo: { equals: grnNo, mode: 'insensitive' } },
          itemCode: { equals: partNo, mode: 'insensitive' },
          barcode: { equals: bc, mode: 'insensitive' }
        },
        include: { grn: true }
      });
    }
    if (!grnDetail) {
      grnDetail = await db.gRNDetail.findFirst({
        where: {
          grn: { grnNo: { equals: grnNo, mode: 'insensitive' } },
          itemCode: { equals: partNo, mode: 'insensitive' }
        },
        include: { grn: true }
      });
    }
  } catch (err) {
    console.warn('Failed to query gRNDetail in QC entry:', err.message);
  }

  // 2. Update stockQty directly in gRNDetail for this part / barcode so Material Issue and Delivery Challan can see the stock
  try {
    if (bc) {
      await db.gRNDetail.updateMany({
        where: {
          grn: { grnNo: { equals: grnNo, mode: 'insensitive' } },
          itemCode: { equals: partNo, mode: 'insensitive' },
          barcode: { equals: bc, mode: 'insensitive' }
        },
        data: { stockQty: qty }
      });
    } else {
      await db.gRNDetail.updateMany({
        where: {
          grn: { grnNo: { equals: grnNo, mode: 'insensitive' } },
          itemCode: { equals: partNo, mode: 'insensitive' }
        },
        data: { stockQty: qty }
      });
    }
  } catch (err) {
    console.warn('gRNDetail stockQty update warning in QC entry:', err.message);
  }

  // 3. Remove previous QC inward stockAdjustment for this specific inspection (distinguishing by barcode when applicable)
  try {
    if (bc) {
      await db.stockAdjustment.deleteMany({
        where: {
          type: 'INWARD',
          partNo: { equals: partNo, mode: 'insensitive' },
          barcode: { equals: bc, mode: 'insensitive' },
          remarks: { startsWith: `QC Inward - ${grnNo}` }
        }
      });
    } else {
      await db.stockAdjustment.deleteMany({
        where: {
          type: 'INWARD',
          partNo: { equals: partNo, mode: 'insensitive' },
          remarks: { startsWith: `QC Inward - ${grnNo} - ${partNo}` },
          OR: [
            { barcode: null },
            { barcode: '' }
          ]
        }
      });
    }
  } catch (err) {
    console.warn('stockAdjustment delete warning in QC entry:', err.message);
  }

  // 4. Remove previous QC inward in stock_liability_1 for this specific inspection (distinguishing by barcode when applicable)
  try {
    if (bc) {
      await db.$executeRawUnsafe(
        `DELETE FROM stock_liability_1 
         WHERE voucher_no = $1 
           AND LOWER(part_no) = LOWER($2) 
           AND LOWER(barcode) = LOWER($3)
           AND (voucher_type IN ('Stock Inward', 'STOCK INWARD', 'GRN Entry') OR vourtype IN ('Stock Inward', 'STOCK INWARD', 'GRN Entry'))`,
        grnNo,
        partNo,
        bc
      );
    } else {
      await db.$executeRawUnsafe(
        `DELETE FROM stock_liability_1 
         WHERE voucher_no = $1 
           AND LOWER(part_no) = LOWER($2) 
           AND (barcode IS NULL OR barcode = '')
           AND (voucher_type IN ('Stock Inward', 'STOCK INWARD', 'GRN Entry') OR vourtype IN ('Stock Inward', 'STOCK INWARD', 'GRN Entry'))`,
        grnNo,
        partNo
      );
    }
  } catch (err) {
    console.warn('stock_liability_1 delete warning in QC entry:', err.message);
  }

  if (qty <= 0) {
    // Approved qty is 0, nothing to insert into inward stock tables
    return;
  }

  // 5. Find item in ItemMaster for id, partName, purchaseRate, rate, and unitId
  let item = null;
  try {
    item = await db.itemMaster.findFirst({
      where: { partNo: { equals: partNo, mode: 'insensitive' } },
      select: { id: true, partNo: true, partName: true, purchaseRate: true, rate: true, unitId: true, barcodeType: true }
    });
  } catch (err) {
    console.warn('Failed to fetch item from itemMaster:', err.message);
  }

  let resolvedUom = uom || grnDetail?.unit || null;
  if (!resolvedUom && item?.unitId) {
    try {
      const uomRef = await db.referenceMaster.findUnique({
        where: { id: item.unitId },
        select: { description: true }
      });
      resolvedUom = uomRef?.description || null;
    } catch (_) {}
  }

  const itemId = item?.id || null;
  const partName = item?.partName || grnDetail?.itemName || null;
  const rate = Number(grnDetail?.unitPrice) || Number(item?.purchaseRate) || Number(item?.rate) || 0;
  const amount = Number((qty * rate).toFixed(2));
  const vDate = grnDate ? new Date(grnDate) : (grnDetail?.grn?.grnDate ? new Date(grnDetail.grn.grnDate) : new Date());

  const rawBType = (item?.barcodeType || (bc ? 'Multiple' : 'Single')).trim();
  const normalizedBType = (rawBType.toLowerCase() === 'multiple' || rawBType.toLowerCase() === 'm') ? 'Multiple' : 'Single';

  const remarks = bc
    ? `QC Inward - ${grnNo} - ${partNo} - ${bc} (Approved Qty)`
    : `QC Inward - ${grnNo} - ${partNo} (Approved Qty)`;

  // 6. Create stockAdjustment record
  try {
    await db.stockAdjustment.create({
      data: {
        partNo,
        partName,
        qty,
        uom: resolvedUom,
        price: rate,
        amount,
        barcode: bc,
        barcodeType: normalizedBType,
        type: 'INWARD',
        remarks,
        createdAt: vDate,
        createdBy: inspectedBy || 'Quality Inspector',
        updatedBy: inspectedBy || 'Quality Inspector',
      }
    });
  } catch (err) {
    console.warn('stockAdjustment create warning in QC entry:', err.message);
  }

  // 7. Insert into stock_liability_1 table
  try {
    await db.$executeRawUnsafe(
      `INSERT INTO stock_liability_1 (
        voucher_type, vourtype, voucher_no, voucher_date,
        item_id, source_item_id, part_no, inward_qty, outward_qty, rate, amount,
        credit_amt, debit_amt, created_by, created_date, status, statues, barcode, is_item_matched
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      )`,
      'GRN Entry',
      'GRN Entry',
      grnNo,
      vDate,
      itemId,
      itemId,
      partNo,
      qty,
      0,
      rate,
      amount,
      amount,
      0,
      inspectedBy || 'Quality Inspector',
      new Date(),
      'A',
      'A',
      bc,
      true
    );
  } catch (err) {
    console.warn('stock_liability_1 insert warning in QC entry:', err.message);
  }

  // 8. Publish socket events
  try {
    eventBus.publish(SOCKET_EVENTS.STOCK_UPDATED, {
      partNo,
      stockQty: qty,
      referenceType: 'QC_ENTRY',
      grnNo,
      barcode: bc
    });
    eventBus.publish(SOCKET_EVENTS.STOCK_ADJUSTED, {
      partNo,
      stockQty: qty,
      referenceType: 'StockAdjustment',
      grnNo,
      barcode: bc
    });
  } catch (eventErr) {
    console.warn('Event publish warning in QC entry:', eventErr.message);
  }

  // 9. When QC check is Ok / approved for this part number, update specific GRN status to 'Closed'
  try {
    if (qty > 0) {
      const grnMaster = await db.gRNMaster.findFirst({
        where: { grnNo: { equals: grnNo, mode: 'insensitive' } },
        include: { details: true }
      });

      if (grnMaster) {
        const pendingQualityItems = grnMaster.details.filter(d => {
          const isQuality = (d.qcType || '').toUpperCase() === 'QUALITY';
          if (!isQuality) return false;
          if (bc && d.barcode && d.barcode.toLowerCase() === bc.toLowerCase()) return false;
          if (!bc && d.itemCode && d.itemCode.toLowerCase() === partNo.toLowerCase()) return false;
          return !d.stockQty || Number(d.stockQty) <= 0;
        });

        if (pendingQualityItems.length === 0) {
          await db.gRNMaster.update({
            where: { id: grnMaster.id },
            data: { status: 'Closed' }
          });
          eventBus.publish(SOCKET_EVENTS.GRN_UPDATED, {
            referenceId: grnMaster.id,
            referenceNumber: grnMaster.grnNo,
            grnNo: grnMaster.grnNo,
            status: 'Closed'
          });
        }
      }
    }
  } catch (statusErr) {
    console.warn('Failed to update GRN status to Closed in QC entry:', statusErr.message);
  }
}
