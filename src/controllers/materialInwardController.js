import * as GRNModel from '../models/grnMasterModel.js';
import { BadRequestError, NotFoundError } from "../middlewares/customErrors.js";
import { eventBus } from '../services/eventBus.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';
import { getActorContext } from '../utils/actorContext.js';

const toFloat = (v) => (v !== '' && v != null ? parseFloat(v) || 0 : 0);

export const getNextNo = async (req, res) => {
  try {
    const { year, date } = req.query;
    const result = await GRNModel.getNextMaterialInwardNo(req.db, { year, date });
    res.json({ success: true, ...result });
  } catch (err) {
    throw err;
  }
};

export const getNextBarcode = async (req, res) => {
  try {
    const [maxLiab, maxAdj] = await Promise.all([
      req.db.$queryRawUnsafe(`
        SELECT max(substring(barcode from 2)::int) as max_num
        FROM stock_liability_1
        WHERE barcode ~ '^M[0-9]{5,}$'
      `).catch(() => [{ max_num: 0 }]),
      req.db.$queryRawUnsafe(`
        SELECT max(substring(barcode from 2)::int) as max_num
        FROM stock_adjustment
        WHERE barcode ~ '^M[0-9]{5,}$'
      `).catch(() => [{ max_num: 0 }])
    ]);

    const num1 = maxLiab?.[0]?.max_num || 0;
    const num2 = maxAdj?.[0]?.max_num || 0;
    const highest = Math.max(num1, num2);
    const nextSeq = highest > 0 ? highest + 1 : 1;
    const nextBarcode = `M${String(nextSeq).padStart(5, '0')}`;

    res.json({
      success: true,
      highest,
      nextSeq,
      nextBarcode
    });
  } catch (err) {
    throw err;
  }
};

export const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 1000;
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      req.db.gRNMaster.findMany({
        where: {
          OR: [
            { grnType: 'MATERIAL_INWARD' },
            { grnType: 'MATERIAL INWARD' },
            { remarks: { contains: '"isMaterialInward":true' } }
          ]
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { details: { orderBy: { slNo: 'asc' } } }
      }),
      req.db.gRNMaster.count({
        where: {
          OR: [
            { grnType: 'MATERIAL_INWARD' },
            { grnType: 'MATERIAL INWARD' },
            { remarks: { contains: '"isMaterialInward":true' } }
          ]
        }
      })
    ]);

    // Parse metadata from remarks
    const formatted = entries.map(entry => {
      let meta = {};
      try {
        if (entry.remarks && entry.remarks.startsWith('{')) {
          meta = JSON.parse(entry.remarks);
        }
      } catch {}

      const itemsMeta = meta.itemsMeta || [];

      return {
        ...entry,
        supplierCode: meta.supplierCode || entry.contactPerson || '',
        address: meta.address || entry.contactNo || '',
        details: (entry.details || []).map((detail, idx) => {
          const itemM = itemsMeta[idx] || itemsMeta.find(m => m.partNo === detail.itemCode) || {};
          return {
            ...detail,
            partNo: detail.itemCode,
            partName: detail.itemName,
            brand: itemM.brand || '',
            model: itemM.model || '',
            uom: detail.unit || itemM.uom || '',
            loc: itemM.loc || '',
            rate: detail.unitPrice,
            amount: detail.total || (detail.qty * detail.unitPrice),
            barcode: detail.barcode || itemM.barcode || '',
            barcodeType: itemM.barcodeType || detail.barcodeType || 'Single',
            barcodes: itemM.barcodes || (detail.barcode ? [detail.barcode] : []),
          };
        })
      };
    });

    res.json({ success: true, data: formatted, total, page, limit });
  } catch (err) {
    throw err;
  }
};

export const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const entry = await req.db.gRNMaster.findUnique({
      where: { id },
      include: { details: { orderBy: { slNo: 'asc' } } }
    });

    if (!entry) throw new NotFoundError('Material Inward record not found');

    let meta = {};
    try {
      if (entry.remarks && entry.remarks.startsWith('{')) {
        meta = JSON.parse(entry.remarks);
      }
    } catch {}

    const itemsMeta = meta.itemsMeta || [];

    const formatted = {
      ...entry,
      supplierCode: meta.supplierCode || entry.contactPerson || '',
      address: meta.address || entry.contactNo || '',
      details: (entry.details || []).map((detail, idx) => {
        const itemM = itemsMeta[idx] || itemsMeta.find(m => m.partNo === detail.itemCode) || {};
        return {
          ...detail,
          partNo: detail.itemCode,
          partName: detail.itemName,
          brand: itemM.brand || '',
          model: itemM.model || '',
          uom: detail.unit || itemM.uom || '',
          loc: itemM.loc || '',
          rate: detail.unitPrice,
          amount: detail.total || (detail.qty * detail.unitPrice),
          barcode: detail.barcode || itemM.barcode || '',
          barcodeType: itemM.barcodeType || detail.barcodeType || 'Single',
          barcodes: itemM.barcodes || (detail.barcode ? [detail.barcode] : []),
        };
      })
    };

    res.json({ success: true, data: formatted });
  } catch (err) {
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const {
      grnNo,
      financialYear,
      grnDate,
      invoiceNo,
      invoiceDate,
      supplierName,
      supplierCode,
      address,
      remarks,
      items = []
    } = req.body;

    if (!grnNo) {
      throw new BadRequestError('GRN No is required');
    }

    if (!items || items.length === 0) {
      throw new BadRequestError('At least one part item must be added');
    }

    // Build structured metadata for remarks to preserve supplierCode, address, brand, model, loc
    const itemsMeta = items.map(it => ({
      partNo: it.partNo || it.itemCode || '',
      brand: it.brand || '',
      model: it.model || '',
      uom: it.uom || it.unit || '',
      loc: it.loc || '',
      barcodeType: it.barcodeType || 'Single',
      barcode: it.barcode || '',
      barcodes: Array.isArray(it.barcodes) ? it.barcodes : (it.barcode ? [it.barcode] : [])
    }));

    const metaPayload = {
      isMaterialInward: true,
      supplierCode: supplierCode || '',
      address: address || '',
      userRemarks: remarks || '',
      itemsMeta
    };

    let subTotal = 0;
    const detailRows = items.map((it, idx) => {
      const qty = toFloat(it.qty);
      const unitPrice = toFloat(it.rate ?? it.unitPrice);
      const total = qty * unitPrice;
      subTotal += total;

      const bType = it.barcodeType || 'Single';
      const bList = Array.isArray(it.barcodes) ? it.barcodes : (it.barcode ? [it.barcode] : []);

      return {
        slNo: idx + 1,
        itemCode: it.partNo || it.itemCode || '',
        itemName: it.partName || it.itemName || '',
        qcType: 'STORE',
        supplierPartNo: it.supplierPartNo || null,
        description: it.description || null,
        hsnCode: it.hsnCode || null,
        unit: it.uom || it.unit || 'No',
        stockQty: qty,
        orderQty: qty,
        qty: qty,
        unitPrice: unitPrice,
        total: total,
        discPer: 0,
        discAmt: 0,
        finalPrice: total,
        taxPer: 0,
        netAmt: total,
        barcode: it.barcode || (bList[0] || null),
        barcodes: bList,
        barcodeType: bType,
      };
    });

    const headerData = {
      grnNo: grnNo.trim(),
      financialYear: financialYear || '',
      grnDate: grnDate ? new Date(grnDate) : new Date(),
      grnType: 'MATERIAL_INWARD',
      supplierName: supplierName || null,
      contactPerson: supplierCode || null,
      contactNo: address ? String(address).substring(0, 100) : null,
      invoiceNo: invoiceNo || null,
      invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
      qcType: 'STORE',
      discountType: 'Dis_Per',
      remarks: JSON.stringify(metaPayload),
      currencyTotal: subTotal,
      roundOff: 0,
      subTotal: subTotal,
      totalAmount: subTotal,
      status: 'Closed', // Inward completed into store
      createdBy: req.user?.username || req.user?.email || 'Admin',
      updatedBy: req.user?.username || req.user?.email || 'Admin',
    };

    const record = await GRNModel.createGRNEntry(req.db, headerData, detailRows);

    const actorContext = await getActorContext(req);
    eventBus.publish(SOCKET_EVENTS.GRN_CREATED, {
      referenceId: record.id,
      referenceNumber: record.grnNo,
      referenceType: "grn",
      grnNo: record.grnNo,
      userId: req.user?.id,
      actorContext
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new BadRequestError(`GRN No already exists. Please fetch the next number.`);
    }
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await GRNModel.deleteGRNEntry(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Material Inward record not found');
    }
    throw err;
  }
};
