import { getFinancialYear } from "../utils/date.js";

const getOffsetBarcode = (grnbarcode, offset) => {
  if (!grnbarcode) return '';
  const numericPart = grnbarcode.match(/\d+$/);
  if (numericPart) {
    const numStr = numericPart[0];
    const prefix = grnbarcode.substring(0, grnbarcode.length - numStr.length);
    const baseNum = parseInt(numStr, 10);
    const nextNum = baseNum + offset;
    const paddedNum = String(nextNum).padStart(numStr.length, '0');
    return `${prefix}${paddedNum}`;
  }
  return offset > 0 ? `${grnbarcode}-${offset}` : grnbarcode;
};

const expandDetailRows = (detailRows, grnbarcode, barcodeTypeMap, isStoreItemFn) => {
  const expanded = [];
  let barcodeOffset = 0;

  detailRows.forEach(row => {
    const isStore = isStoreItemFn ? isStoreItemFn(row) : (row.qcType || '').toUpperCase() === 'STORE';
    const resolvedQcType = isStore ? 'STORE' : 'QUALITY';

    // Verify barcode type from Item Master first, fallback to row or default Single
    const cKey = (row.itemCode || '').trim();
    const imType = barcodeTypeMap[cKey] || barcodeTypeMap[cKey.toLowerCase()] || barcodeTypeMap[cKey.toUpperCase()] || barcodeTypeMap[row.itemCode];
    const rawType = (imType || row.barcodeType || 'Single').toLowerCase();
    const isMultiple = rawType === 'multiple' || rawType === 'm';

    if (isMultiple) {
      const qty = Math.max(1, Math.floor(row.qty || 0));
      if (qty > 0) {
        const singleUnitPrice = row.unitPrice || 0;
        const singleTotal = singleUnitPrice;
        const singleDiscAmt = (row.discAmt || 0) / qty;
        const singleFinalPrice = singleTotal - singleDiscAmt;
        const singleNetAmt = singleFinalPrice * (1 + (row.taxPer || 0) / 100);

        const suppliedBarcodes = Array.isArray(row.barcodes) && row.barcodes.length > 0 ? row.barcodes : null;

        for (let j = 0; j < qty; j++) {
          const bc = (suppliedBarcodes && suppliedBarcodes[j])
            ? suppliedBarcodes[j]
            : getOffsetBarcode(grnbarcode, barcodeOffset + j);
          expanded.push({
            ...row,
            qcType: resolvedQcType,
            qty: 1.0,
            stockQty: isStore ? 1.0 : 0.0,
            total: singleTotal,
            discAmt: singleDiscAmt,
            finalPrice: singleFinalPrice,
            netAmt: singleNetAmt,
            barcode: bc,
            barcodeType: 'Multiple',
            isStore,
          });
        }
        barcodeOffset += qty;
      }
    } else {
      const bc = row.barcode || (Array.isArray(row.barcodes) && row.barcodes[0]) || getOffsetBarcode(grnbarcode, barcodeOffset);
      const rowQty = Number(row.qty || 0);
      expanded.push({
        ...row,
        qcType: resolvedQcType,
        stockQty: isStore ? rowQty : 0.0,
        barcode: bc,
        barcodeType: 'Single',
        isStore,
      });
      barcodeOffset += 1;
    }
  });

  return expanded;
};

const sanitizeGRNDetail = (r, grnId, slNo) => ({
  grnId,
  slNo,
  itemCode: r.itemCode ? String(r.itemCode) : null,
  itemName: r.itemName ? String(r.itemName) : null,
  qcType: r.qcType ? String(r.qcType) : null,
  supplierPartNo: r.supplierPartNo ? String(r.supplierPartNo) : null,
  description: r.description ? String(r.description) : null,
  hsnCode: r.hsnCode ? String(r.hsnCode) : null,
  unit: r.unit ? String(r.unit) : null,
  stockQty: Number(r.stockQty || 0),
  orderQty: Number(r.orderQty || 0),
  qty: Number(r.qty || 0),
  unitPrice: Number(r.unitPrice || 0),
  total: Number(r.total || 0),
  discPer: Number(r.discPer || 0),
  discAmt: Number(r.discAmt || 0),
  finalPrice: Number(r.finalPrice || 0),
  taxPer: Number(r.taxPer || 0),
  netAmt: Number(r.netAmt || 0),
  barcode: r.barcode ? String(r.barcode) : null,
});

const syncStoreItemsToStock = async (tx, headerData, expandedDetails, barcodeTypeMap, itemMap) => {
  const isMaterialInward =
    headerData.grnType === 'MATERIAL_INWARD' ||
    (typeof headerData.remarks === 'string' && headerData.remarks.includes('isMaterialInward')) ||
    String(headerData.grnNo || '').trim().startsWith('GR');

  const voucherType = isMaterialInward ? 'Stock Inward' : 'GRN Entry';
  const stockAdjustmentsToCreate = [];

  expandedDetails.forEach(exp => {
    if (exp.isStore) {
      const codeKey = (exp.itemCode || '').trim();
      const matchedItem = itemMap[codeKey] || itemMap[codeKey.toLowerCase()] || itemMap[codeKey.toUpperCase()] || itemMap[exp.itemCode];
      const rawBType = exp.barcodeType || (codeKey ? barcodeTypeMap[codeKey] : null) || (exp.itemCode ? barcodeTypeMap[exp.itemCode] : null) || 'Single';
      const normalizedBType = (rawBType === 'Multiple' || rawBType === 'M' || rawBType === 'm') ? 'Multiple' : 'Single';
      stockAdjustmentsToCreate.push({
        partNo: exp.itemCode,
        partName: exp.itemName || matchedItem?.partName || null,
        qty: Number(exp.qty) || 0,
        uom: exp.unit || null,
        price: Number(exp.unitPrice) || Number(matchedItem?.purchaseRate) || Number(matchedItem?.rate) || 0,
        amount: Number(exp.netAmt || exp.total || ((Number(exp.qty) || 0) * (Number(exp.unitPrice) || 0))) || 0,
        barcode: exp.barcode || null,
        barcodeType: normalizedBType,
        type: 'INWARD',
        remarks: isMaterialInward
          ? `Material Inward - ${headerData.grnNo} (Store Item)`
          : `GRN Inward - ${headerData.grnNo} (Store Item)`,
        createdAt: headerData.grnDate ? new Date(headerData.grnDate) : new Date(),
        createdBy: headerData.createdBy || 'Admin',
        updatedBy: headerData.createdBy || 'Admin',
      });
    }
  });

  if (stockAdjustmentsToCreate.length > 0) {
    await tx.stockAdjustment.createMany({
      data: stockAdjustmentsToCreate,
    });

    for (const adj of stockAdjustmentsToCreate) {
      const adjCode = (adj.partNo || '').trim();
      const matchedItem = itemMap[adjCode] || itemMap[adjCode.toLowerCase()] || itemMap[adjCode.toUpperCase()] || itemMap[adj.partNo];
      try {
        await tx.$executeRawUnsafe(
          `INSERT INTO stock_liability_1 (
            voucher_type, vourtype, voucher_no, voucher_date,
            item_id, source_item_id, part_no, inward_qty, outward_qty, rate, amount,
            credit_amt, debit_amt, created_by, created_date, status, statues, barcode, is_item_matched
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
          )`,
          voucherType,
          voucherType,
          headerData.grnNo,
          headerData.grnDate ? new Date(headerData.grnDate) : new Date(),
          matchedItem?.id || null,
          matchedItem?.id || null,
          adj.partNo,
          adj.qty,
          0,
          adj.price,
          adj.amount,
          adj.amount,
          0,
          headerData.createdBy || 'Admin',
          new Date(),
          'A',
          'A',
          adj.barcode || null,
          true
        );
      } catch (liabilityErr) {
        console.warn('stock_liability_1 insert warning:', liabilityErr.message);
      }
    }
  }

  return stockAdjustmentsToCreate;
};

const deleteStockForGRN = async (tx, grnNo) => {
  if (!grnNo) return;
  await tx.stockAdjustment.deleteMany({
    where: {
      OR: [
        { remarks: { startsWith: `GRN Inward - ${grnNo}` } },
        { remarks: { startsWith: `Material Inward - ${grnNo}` } },
        { remarks: { startsWith: `Stock Inward - ${grnNo}` } }
      ]
    }
  });
  try {
    await tx.$executeRawUnsafe(
      `DELETE FROM stock_liability_1 
       WHERE voucher_no = $1 
         AND (voucher_type IN ('Stock Inward', 'STOCK INWARD', 'GRN Entry') 
              OR vourtype IN ('Stock Inward', 'STOCK INWARD', 'GRN Entry'))`,
      grnNo
    );
  } catch (err) {
    console.warn('stock_liability_1 delete warning:', err.message);
  }
};

export const getNextMaterialInwardNo = async (db, options = {}) => {
  const fy = options.year || getFinancialYear(options.date ? new Date(options.date) : new Date());
  const prefix = `GR${fy}/`;
  const pattern = `${prefix}%`;

  const rows = await db.$queryRaw`
    SELECT "grnNo" FROM grn_master
    WHERE "grnNo" LIKE ${pattern}
    ORDER BY "grnNo" DESC
    LIMIT 1
  `;

  if (rows && rows.length > 0) {
    const lastNo = rows[0].grnNo;
    const parts = lastNo.split('/');
    const seqStr = parts[parts.length - 1];
    const seq = parseInt(seqStr, 10);
    if (!isNaN(seq)) {
      return { grnNo: `${prefix}${String(seq + 1).padStart(4, '0')}`, financialYear: fy };
    }
  }

  // Fallback: check any GR% records if prefix format was slightly different
  const fallback = await db.$queryRaw`
    SELECT "grnNo" FROM grn_master
    WHERE "grnNo" LIKE 'GR%'
    ORDER BY id DESC
    LIMIT 1
  `;
  if (fallback && fallback.length > 0) {
    const parts = fallback[0].grnNo.split('/');
    if (parts.length > 1) {
      const seqStr = parts[parts.length - 1];
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && fallback[0].grnNo.startsWith(prefix)) {
        return { grnNo: `${prefix}${String(seq + 1).padStart(4, '0')}`, financialYear: fy };
      }
    }
  }

  return { grnNo: `${prefix}0001`, financialYear: fy };
};

export const getNextGRNNo = async (db) => {
  const fy = getFinancialYear();
  const pattern = `${fy}/GRN%`;
  const rows = await db.$queryRaw`
    SELECT "grnNo" FROM grn_master
    WHERE "grnNo" LIKE ${pattern}
    ORDER BY "grnNo" DESC
    LIMIT 1
  `;
  if (rows.length > 0) {
    const prefix = `${fy}/GRN`;
    const seq = parseInt(rows[0].grnNo.replace(prefix, ''), 10);
    return { grnNo: `${prefix}${String(seq + 1).padStart(5, '0')}`, financialYear: fy };
  }
  return { grnNo: `${fy}/GRN00001`, financialYear: fy };
};

export const GRN_ENTRY_ONLY_WHERE = {
  AND: [
    {
      OR: [
        { grnType: null },
        {
          NOT: {
            grnType: { in: ['MATERIAL_INWARD', 'MATERIAL INWARD', 'material_inward'] }
          }
        }
      ]
    },
    {
      NOT: {
        grnNo: { startsWith: 'GR' }
      }
    },
    {
      OR: [
        { remarks: null },
        {
          NOT: {
            remarks: { contains: 'isMaterialInward' }
          }
        }
      ]
    }
  ]
};

export const getAllGRNEntries = async (db, page = 1, limit = 20, options = {}) => {
  const skip = (page - 1) * limit;
  const where = options.includeMaterialInward ? {} : GRN_ENTRY_ONLY_WHERE;
  const [entries, total] = await Promise.all([
    db.gRNMaster.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { details: { orderBy: { slNo: 'asc' } } },
    }),
    db.gRNMaster.count({ where })
  ]);
  const itemCodes = new Set();
  entries.forEach(entry => {
    if (entry.details) {
      entry.details.forEach(d => {
        if (d.itemCode) itemCodes.add(d.itemCode);
      });
    }
  });

  const items = await db.itemMaster.findMany({
    where: {
      partNo: { in: Array.from(itemCodes) }
    },
    select: { partNo: true, barcodeType: true },
  });
  const barcodeTypeMap = {};
  items.forEach(item => {
    if (item.partNo) {
      const rawB = (item.barcodeType || '').trim().toUpperCase();
      const bType = (rawB === 'M' || rawB === 'MULTIPLE') ? 'Multiple' : 'Single';
      barcodeTypeMap[item.partNo] = bType;
      barcodeTypeMap[item.partNo.trim()] = bType;
    }
  });
  return entries.map(entry => ({
    ...entry,
    details: (entry.details || []).map(detail => ({
      ...detail,
      barcodeType: barcodeTypeMap[detail.itemCode] || barcodeTypeMap[detail.itemCode?.trim()] || 'Single',
    })),
  }));
};

export const getGRNEntryById = async (db, id) => {
  const entry = await db.gRNMaster.findUnique({
    where: { id },
    include: { details: { orderBy: { slNo: 'asc' } } },
  });
  if (!entry) return null;
  const itemCodes = new Set();
  if (entry.details) {
    entry.details.forEach(d => {
      if (d.itemCode) itemCodes.add(d.itemCode);
    });
  }

  const items = await db.itemMaster.findMany({
    where: {
      partNo: { in: Array.from(itemCodes) }
    },
    select: { partNo: true, barcodeType: true },
  });
  const barcodeTypeMap = {};
  items.forEach(item => {
    if (item.partNo) {
      const rawB = (item.barcodeType || '').trim().toUpperCase();
      const bType = (rawB === 'M' || rawB === 'MULTIPLE') ? 'Multiple' : 'Single';
      barcodeTypeMap[item.partNo] = bType;
      barcodeTypeMap[item.partNo.trim()] = bType;
    }
  });
  return {
    ...entry,
    details: (entry.details || []).map(detail => ({
      ...detail,
      barcodeType: barcodeTypeMap[detail.itemCode] || barcodeTypeMap[detail.itemCode?.trim()] || 'Single',
    })),
  };
};


const getYYYYMMDD = (date) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

const TX_OPTS = { maxWait: 10000, timeout: 20000 };

export const createGRNEntry = (db, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    const dateStr = getYYYYMMDD(headerData.grnDate);

    const itemCodes = new Set();
    detailRows.forEach(row => {
      if (row.itemCode) itemCodes.add(row.itemCode.trim());
    });

    const items = await tx.itemMaster.findMany({
      select: { id: true, partNo: true, partName: true, barcodeType: true, qcTypeId: true, purchaseRate: true, rate: true },
    });
    const barcodeTypeMap = {};
    const itemMap = {};
    items.forEach(item => {
      if (item.partNo) {
        const raw = item.partNo;
        const trimmed = raw.trim();
        const rawB = (item.barcodeType || '').trim().toUpperCase();
        const bType = (rawB === 'M' || rawB === 'MULTIPLE') ? 'Multiple' : 'Single';

        barcodeTypeMap[raw] = bType;
        barcodeTypeMap[trimmed] = bType;
        barcodeTypeMap[trimmed.toLowerCase()] = bType;
        barcodeTypeMap[trimmed.toUpperCase()] = bType;

        itemMap[raw] = item;
        itemMap[trimmed] = item;
        itemMap[trimmed.toLowerCase()] = item;
        itemMap[trimmed.toUpperCase()] = item;
      }
    });

    const qcRefs = await tx.referenceMaster.findMany({
      where: {
        OR: [
          { referenceType: 'QC_Type' },
          { referenceType: 'QC Type' },
          { referenceType: 'qc_type' }
        ]
      },
      select: { id: true, description: true, code: true }
    });
    const storeRefIds = new Set([
      391, // Standard Store QC Reference ID
      ...qcRefs.filter(r => (r.description || '').trim().toUpperCase() === 'STORE' || (r.code || '').trim() === '002').map(r => r.id)
    ]);

    const isStoreItem = (row) => {
      const gType = (headerData.grnType || '').toUpperCase();
      if (gType === 'MATERIAL_INWARD' || gType === 'MATERIAL INWARD') return true;

      const codeKey = (row.itemCode || '').trim();
      const item = itemMap[codeKey] || itemMap[codeKey.toLowerCase()] || itemMap[codeKey.toUpperCase()] || itemMap[row.itemCode];

      // 1. Primary rule: If the selected part number has QC type 'STORE' in Item Master, it must be updated in stock
      if (item && item.qcTypeId && storeRefIds.has(item.qcTypeId)) {
        return true;
      }

      // 2. Fallback if row explicitly specifies STORE
      const rowQcUpper = (row.qcType || '').trim().toUpperCase();
      if (rowQcUpper === 'STORE') {
        return true;
      }

      return false;
    };

    // Find the highest sequence used on this date across grn_master and grn_detail
    const [maxMasterBarcode, maxDetailBarcode] = await Promise.all([
      tx.gRNMaster.findFirst({
        where: { grnbarcode: { startsWith: dateStr } },
        select: { grnbarcode: true },
        orderBy: { grnbarcode: 'desc' },
      }),
      tx.gRNDetail.findFirst({
        where: { barcode: { startsWith: dateStr } },
        select: { barcode: true },
        orderBy: { barcode: 'desc' },
      }),
    ]);

    let maxSeq = 0;
    const checkBarcode = (bc) => {
      if (bc && bc.startsWith(dateStr)) {
        const seqStr = bc.slice(dateStr.length);
        const num = parseInt(seqStr, 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    };
    checkBarcode(maxMasterBarcode?.grnbarcode);
    checkBarcode(maxDetailBarcode?.barcode);

    const nextSeq = maxSeq > 0 ? maxSeq + 1 : 1;
    const grnbarcode = `${dateStr}${String(nextSeq).padStart(3, '0')}`;

    const expandedDetails = expandDetailRows(detailRows, grnbarcode, barcodeTypeMap, isStoreItem);
    const hasQualityItems = expandedDetails.length > 0 && expandedDetails.some(d => !d.isStore);
    const resolvedStatus = hasQualityItems ? (headerData.status || 'Open') : 'Closed';

    const master = await tx.gRNMaster.create({
      data: {
        ...headerData,
        status: resolvedStatus,
        grnbarcode,
      },
    });
    if (headerData.gateEntryNo) {
      await tx.gateMaster.updateMany({
        where: { gateEntryNo: headerData.gateEntryNo },
        data: { status: 'Closed' },
      });
    }
    if (expandedDetails.length > 0) {
      const cleanDetails = expandedDetails.map((r, i) => sanitizeGRNDetail(r, master.id, i + 1));
      await tx.gRNDetail.createMany({
        data: cleanDetails,
      });
    }

    await syncStoreItemsToStock(tx, headerData, expandedDetails, barcodeTypeMap, itemMap);

    return tx.gRNMaster.findUnique({
      where: { id: master.id },
      include: { details: { orderBy: { slNo: 'asc' } } },
    });
  }, TX_OPTS);

export const updateGRNEntry = (db, id, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    const existing = await tx.gRNMaster.findUnique({ where: { id } });
    if (!existing) return null;

    let grnbarcode = existing.grnbarcode;
    const dateStr = getYYYYMMDD(headerData.grnDate || existing.grnDate);

    const itemCodes = new Set();
    detailRows.forEach(row => {
      if (row.itemCode) itemCodes.add(row.itemCode);
    });

    const items = await tx.itemMaster.findMany({
      select: { id: true, partNo: true, partName: true, barcodeType: true, qcTypeId: true, purchaseRate: true, rate: true },
    });
    const barcodeTypeMap = {};
    const itemMap = {};
    items.forEach(item => {
      if (item.partNo) {
        const raw = item.partNo;
        const trimmed = raw.trim();
        const rawB = (item.barcodeType || '').trim().toUpperCase();
        const bType = (rawB === 'M' || rawB === 'MULTIPLE') ? 'Multiple' : 'Single';

        barcodeTypeMap[raw] = bType;
        barcodeTypeMap[trimmed] = bType;
        barcodeTypeMap[trimmed.toLowerCase()] = bType;
        barcodeTypeMap[trimmed.toUpperCase()] = bType;

        itemMap[raw] = item;
        itemMap[trimmed] = item;
        itemMap[trimmed.toLowerCase()] = item;
        itemMap[trimmed.toUpperCase()] = item;
      }
    });

    const qcRefs = await tx.referenceMaster.findMany({
      where: {
        OR: [
          { referenceType: 'QC_Type' },
          { referenceType: 'QC Type' },
          { referenceType: 'qc_type' }
        ]
      },
      select: { id: true, description: true, code: true }
    });
    const storeRefIds = new Set([
      391, // Standard Store QC Reference ID
      ...qcRefs.filter(r => (r.description || '').trim().toUpperCase() === 'STORE' || (r.code || '').trim() === '002').map(r => r.id)
    ]);

    const isStoreItem = (row) => {
      const gType = (headerData.grnType || '').toUpperCase();
      if (gType === 'MATERIAL_INWARD' || gType === 'MATERIAL INWARD') return true;

      const codeKey = (row.itemCode || '').trim();
      const item = itemMap[codeKey] || itemMap[codeKey.toLowerCase()] || itemMap[codeKey.toUpperCase()] || itemMap[row.itemCode];

      // 1. Primary rule: If the selected part number has QC type 'STORE' in Item Master, it must be updated in stock
      if (item && item.qcTypeId && storeRefIds.has(item.qcTypeId)) {
        return true;
      }

      // 2. Fallback if row explicitly specifies STORE
      const rowQcUpper = (row.qcType || '').trim().toUpperCase();
      if (rowQcUpper === 'STORE') {
        return true;
      }

      return false;
    };

    if (!grnbarcode) {
      const [maxMasterBarcode, maxDetailBarcode] = await Promise.all([
        tx.gRNMaster.findFirst({
          where: { grnbarcode: { startsWith: dateStr } },
          select: { grnbarcode: true },
          orderBy: { grnbarcode: 'desc' },
        }),
        tx.gRNDetail.findFirst({
          where: { barcode: { startsWith: dateStr } },
          select: { barcode: true },
          orderBy: { barcode: 'desc' },
        }),
      ]);

      let maxSeq = 0;
      const checkBarcode = (bc) => {
        if (bc && bc.startsWith(dateStr)) {
          const seqStr = bc.slice(dateStr.length);
          const num = parseInt(seqStr, 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      };
      checkBarcode(maxMasterBarcode?.grnbarcode);
      checkBarcode(maxDetailBarcode?.barcode);

      const nextSeq = maxSeq > 0 ? maxSeq + 1 : 1;
      grnbarcode = `${dateStr}${String(nextSeq).padStart(3, '0')}`;
    }

    const expandedDetails = expandDetailRows(detailRows, grnbarcode, barcodeTypeMap, isStoreItem);
    const hasQualityItems = expandedDetails.length > 0 && expandedDetails.some(d => !d.isStore);
    const resolvedStatus = hasQualityItems ? (headerData.status || existing.status || 'Open') : 'Closed';

    // Delete existing details and associated stock adjustments / liability records
    await tx.gRNDetail.deleteMany({ where: { grnId: id } });
    await deleteStockForGRN(tx, existing.grnNo);

    await tx.gRNMaster.update({
      where: { id },
      data: {
        ...headerData,
        status: resolvedStatus,
        grnbarcode,
      },
    });
    if (headerData.gateEntryNo) {
      await tx.gateMaster.updateMany({
        where: { gateEntryNo: headerData.gateEntryNo },
        data: { status: 'Closed' },
      });
    }

    if (expandedDetails.length > 0) {
      const cleanDetails = expandedDetails.map((r, i) => sanitizeGRNDetail(r, id, i + 1));
      await tx.gRNDetail.createMany({
        data: cleanDetails,
      });
    }

    await syncStoreItemsToStock(tx, { ...headerData, grnNo: existing.grnNo }, expandedDetails, barcodeTypeMap, itemMap);

    return tx.gRNMaster.findUnique({
      where: { id },
      include: { details: { orderBy: { slNo: 'asc' } } },
    });
  }, TX_OPTS);

export const deleteGRNEntry = (db, id) =>
  db.$transaction(async (tx) => {
    const grn = await tx.gRNMaster.findUnique({
      where: { id },
      select: { id: true, grnNo: true, gateEntryNo: true, poNo: true }
    });
    if (grn && grn.gateEntryNo) {
      await tx.gateMaster.updateMany({
        where: { gateEntryNo: grn.gateEntryNo },
        data: { status: 'Open' },
      });
    }
    if (grn && grn.grnNo) {
      await deleteStockForGRN(tx, grn.grnNo);
    }
    await tx.gRNDetail.deleteMany({ where: { grnId: id } });
    return tx.gRNMaster.delete({ where: { id } });
  }, TX_OPTS);
