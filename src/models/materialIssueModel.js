import { getFinancialYear } from "../utils/date.js";
import { ConflictError, BadRequestError } from "../middlewares/customErrors.js";
import { eventBus } from "../services/eventBus.js";
import { SOCKET_EVENTS } from "../utils/socketEvents.js";


export const getNextIssueNo = async (db) => {
  const fy = getFinancialYear();
  const pattern = `${fy}/%`;
  const rows = await db.$queryRaw`
    SELECT "issueNo" FROM material_issue_header
    WHERE "issueNo" LIKE ${pattern}
    ORDER BY "issueNo" DESC
    LIMIT 1
  `;
  const prefix = `${fy}/`;
  if (rows && rows.length > 0) {
    const seqPart = rows[0].issueNo.replace(prefix, '');
    const seq = parseInt(seqPart, 10);
    if (!isNaN(seq)) {
      return { issueNo: `${prefix}${String(seq + 1).padStart(5, '0')}`, financialYear: fy };
    }
  }
  return { issueNo: `${prefix}00001`, financialYear: fy };
};

export const getBOMItems = async (db, servicePartNo, serviceJobNo) => {
  const cleanPartNo = servicePartNo ? servicePartNo.split(' - ')[0].trim() : '';

  const spareWhere = {};
  if (serviceJobNo) {
    spareWhere.serviceJobNo = { equals: serviceJobNo, mode: 'insensitive' };
  }
  if (servicePartNo) {
    spareWhere.OR = [
      { servicePartNo: { equals: servicePartNo, mode: 'insensitive' } },
      { servicePartNo: { startsWith: cleanPartNo, mode: 'insensitive' } },
      { lastSavedAssName: { equals: cleanPartNo, mode: 'insensitive' } },
      { lastSavedAssName: { equals: servicePartNo, mode: 'insensitive' } }
    ];
  } else {
    spareWhere.OR = [
      { servicePartNo: null },
      { servicePartNo: "" }
    ];
  }

  // Find all service spares matching criteria
  const serviceSpares = await db.serviceSpare.findMany({
    where: spareWhere,
    include: {
      items: {
        orderBy: { id: 'asc' }
      }
    },
    orderBy: { id: 'desc' }
  });

  // Reconcile and collect items across matching service spares so the latest issuedQty and balanceQty are always used
  const itemMap = new Map();
  for (const spare of serviceSpares) {
    if (Array.isArray(spare.items)) {
      for (const item of spare.items) {
        const key = item.partNo?.trim().toLowerCase();
        if (!key) continue;
        const rQty = Number(item.requiredQty || 1);
        const iQty = Number(item.issuedQty || 0);
        const bQty = item.balanceQty !== null && item.balanceQty !== undefined
          ? Number(item.balanceQty)
          : Math.max(0, rQty - iQty);

        if (!itemMap.has(key)) {
          itemMap.set(key, {
            id: item.id,
            partNo: item.partNo,
            partName: item.partName,
            qty: rQty,
            rQty: rQty,
            requiredQty: rQty,
            issuedQty: iQty,
            balanceQty: bQty,
            uom: item.uom || 'Nos'
          });
        } else {
          // If another duplicate spare has a higher issuedQty or lower balanceQty, use the most updated state
          const existing = itemMap.get(key);
          if (iQty > existing.issuedQty) {
            existing.issuedQty = iQty;
            existing.balanceQty = Math.max(0, existing.rQty - iQty);
          }
        }
      }
    }
  }

  let items = Array.from(itemMap.values());

  // Fallback: If no items found in serviceSpare and cleanPartNo exists, check bomCreation excelRows
  if (items.length === 0 && cleanPartNo) {
    const bomMatch = await db.bomCreation.findFirst({
      where: {
        OR: [
          { assemblyPartNo: { equals: cleanPartNo, mode: 'insensitive' } },
          { assemblyPartNo: { startsWith: cleanPartNo, mode: 'insensitive' } },
          { bomNo: { equals: cleanPartNo, mode: 'insensitive' } }
        ]
      },
      orderBy: { id: 'desc' }
    });

    if (bomMatch && Array.isArray(bomMatch.excelRows) && bomMatch.excelRows.length > 0) {
      items = bomMatch.excelRows.map((r, idx) => {
        const pNo = r.partNo || r.childPart || r.PartNo || r.itemCode || '';
        const pName = r.partName || r.childPartName || r.PartName || pNo;
        const q = Number(r.qty || r.fasterQty || r.quantity || 1) || 1;
        const u = r.uom || r.unit || r.Unit || 'Nos';
        return {
          id: idx + 1,
          partNo: pNo,
          partName: pName,
          requiredQty: q,
          issuedQty: 0,
          balanceQty: q,
          uom: u
        };
      }).filter(it => it.partNo);
    }
  }

  // Parent part handling (append parent part if not in items list)
  const serviceSpare = serviceSpares[0];
  if (serviceSpare && serviceSpare.servicePartNo) {
    const parts = serviceSpare.servicePartNo.split(' - ');
    const parentPartNo = parts[0].trim();
    const parentPartName = parts[1] ? parts[1].trim() : parentPartNo;

    if (parentPartNo && items.length === 0) {
      const hasParent = items.some(item => item.partNo.toLowerCase() === parentPartNo.toLowerCase());
      if (!hasParent) {
        items.push({
          id: 0, // Virtual ID
          serviceSpareId: serviceSpare.id,
          partNo: parentPartNo,
          partName: parentPartName,
          requiredQty: 1.0,
          issuedQty: 0.0,
          balanceQty: 1.0,
          uom: 'Nos'
        });
      }
    }
  }

  return items
    .map(item => {
      const rQty = Number(item.requiredQty || 1);
      const iQty = Number(item.issuedQty || 0);
      const bQty = item.balanceQty !== null && item.balanceQty !== undefined
        ? Number(item.balanceQty)
        : Math.max(0, rQty - iQty);
      return {
        id: item.id,
        partNo: item.partNo,
        partName: item.partName,
        qty: rQty,
        rQty: rQty,
        requiredQty: rQty,
        issuedQty: iQty,
        balanceQty: bQty,
        uom: item.uom || 'Nos'
      };
    })
    .filter(it => it.balanceQty > 0);
};

export const getBarcodes = async (db, partNo) => {
  const grnBarcodes = await db.gRNDetail.findMany({
    where: {
      itemCode: {
        equals: partNo,
        mode: 'insensitive'
      },
      stockQty: { gt: 0 }
    },
    include: {
      grn: {
        include: {
          details: {
            orderBy: { slNo: 'asc' }
          }
        }
      }
    }
  });

  const adjustmentBarcodes = await db.stockAdjustment.findMany({
    where: {
      partNo: {
        equals: partNo,
        mode: 'insensitive'
      }
    },
    orderBy: { id: 'asc' }
  });

  const itemCodes = new Set();
  grnBarcodes.forEach(g => {
    if (g.grn && g.grn.details) {
      g.grn.details.forEach(d => {
        if (d.itemCode) itemCodes.add(d.itemCode);
      });
    }
  });
  itemCodes.add(partNo);

  const items = await db.itemMaster.findMany({
    where: {
      partNo: { in: Array.from(itemCodes) }
    },
    select: { partNo: true, barcodeType: true },
  });
  const barcodeTypeMap = {};
  items.forEach(item => {
    if (item.partNo) {
      barcodeTypeMap[item.partNo] = item.barcodeType || 'Single';
    }
  });

  const issuedDetails = await db.materialIssueDetail.findMany({
    where: {
      partNo: {
        equals: partNo,
        mode: 'insensitive'
      }
    },
    include: { header: true }
  });
  const issuedBarcodes = new Set(issuedDetails.map(id => (id.barcode || '').trim().toLowerCase()).filter(Boolean));

  // Group stockAdjustment records by barcode to compute net available stock (INWARD - OUTWARD)
  const adjMap = new Map();
  const outwardAdjs = [];
  adjustmentBarcodes.forEach(a => {
    if (!a.barcode) return;
    const bcKey = a.barcode.trim().toLowerCase();
    const q = Number(a.qty || 0);
    const isInward = a.type === 'INWARD';
    if (!isInward) outwardAdjs.push(a);
    const delta = isInward ? q : -q;
    if (!adjMap.has(bcKey)) {
      adjMap.set(bcKey, {
        source: 'adjustment',
        id: a.id,
        barcode: a.barcode.trim(),
        stockQty: delta,
        inwardQty: isInward ? q : 0,
        outwardQty: isInward ? 0 : q,
        rate: a.price || 0,
        uom: a.uom || 'Nos'
      });
    } else {
      const entry = adjMap.get(bcKey);
      entry.stockQty += delta;
      if (isInward) {
        entry.inwardQty += q;
        if (a.price) entry.rate = a.price;
        if (a.uom) entry.uom = a.uom;
      } else {
        entry.outwardQty += q;
      }
    }
  });

  // Account for any materialIssueDetail rows that do not have a corresponding OUTWARD stockAdjustment
  issuedDetails.forEach(m => {
    const bcVal = (m.barcode || '').trim();
    if (!bcVal || bcVal.toUpperCase().startsWith('DIRECT-')) return;
    const bcKey = bcVal.toLowerCase();
    const issNo = m.header?.issueNo ? m.header.issueNo.trim().toLowerCase() : '';
    const hasOutwardAdj = outwardAdjs.some(a => {
      const aBc = (a.barcode || '').trim().toLowerCase();
      if (aBc !== bcKey) return false;
      if (issNo && String(a.remarks || '').toLowerCase().includes(issNo)) return true;
      return false;
    });
    if (!hasOutwardAdj) {
      const q = Number(m.currentIssuedQty || 0);
      if (q > 0 && adjMap.has(bcKey)) {
        const entry = adjMap.get(bcKey);
        entry.stockQty -= q;
        entry.outwardQty += q;
      }
    }
  });

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

  const merged = [];
  const seenBarcodes = new Set();

  grnBarcodes.forEach(g => {
    if (g.barcode) {
      const bcKey = g.barcode.trim().toLowerCase();
      let effectiveGrnStock = Number(g.stockQty || 0);
      if (adjMap.has(bcKey)) {
        const adjEntry = adjMap.get(bcKey);
        if (adjEntry.inwardQty > 0) {
          effectiveGrnStock = Math.min(effectiveGrnStock, Math.max(0, adjEntry.stockQty));
        } else if (adjEntry.outwardQty > 0 && effectiveGrnStock === Number(g.qty || 0)) {
          effectiveGrnStock = Math.max(0, effectiveGrnStock - adjEntry.outwardQty);
        }
      }
      if (effectiveGrnStock > 0 && !seenBarcodes.has(bcKey)) {
        seenBarcodes.add(bcKey);
        merged.push({
          source: 'grn',
          id: g.id,
          barcode: g.barcode.trim(),
          stockQty: Number(effectiveGrnStock.toFixed(4)),
          rate: g.unitPrice || 0,
          uom: g.unit || 'Nos'
        });
      }
    } else if (g.grn && g.grn.grnbarcode) {
      // Calculate offset of this detail record within the GRN
      let offset = 0;
      for (const d of g.grn.details) {
        if (d.id === g.id) {
          break;
        }
        const type = (barcodeTypeMap[d.itemCode] || 'Single').toLowerCase();
        if (type === 'multiple') {
          offset += Math.floor(d.qty || 0);
        } else {
          offset += 1;
        }
      }

      const itemStartBarcode = getOffsetBarcode(g.grn.grnbarcode, offset);
      const itemBarcodeType = (barcodeTypeMap[g.itemCode] || 'Single').toLowerCase();

      if (itemBarcodeType === 'multiple') {
        const totalQty = Math.floor(g.qty || 0);
        const maxRemainingUnits = Math.floor(Number(g.stockQty || 0));
        let addedUnits = 0;
        const numericPart = itemStartBarcode.match(/\d+$/);
        for (let j = 0; j < totalQty && addedUnits < maxRemainingUnits; j++) {
          let bc = '';
          if (numericPart) {
            const numStr = numericPart[0];
            const prefix = itemStartBarcode.substring(0, itemStartBarcode.length - numStr.length);
            const baseNum = parseInt(numStr, 10);
            const nextNum = baseNum + j;
            const paddedNum = String(nextNum).padStart(numStr.length, '0');
            bc = `${prefix}${paddedNum}`;
          } else {
            bc = j === 0 ? itemStartBarcode : `${itemStartBarcode}-${j}`;
          }

          const bcKey = bc.trim().toLowerCase();
          if (!issuedBarcodes.has(bcKey) && !seenBarcodes.has(bcKey)) {
            seenBarcodes.add(bcKey);
            addedUnits++;
            merged.push({
              source: 'grn',
              id: g.id,
              barcode: bc,
              stockQty: 1,
              rate: g.unitPrice || 0,
              uom: g.unit || 'Nos'
            });
          }
        }
      } else {
        const bcKey = itemStartBarcode.trim().toLowerCase();
        let effectiveGrnStock = Number(g.stockQty || 0);
        if (adjMap.has(bcKey)) {
          const adjEntry = adjMap.get(bcKey);
          if (adjEntry.inwardQty > 0) {
            effectiveGrnStock = Math.min(effectiveGrnStock, Math.max(0, adjEntry.stockQty));
          } else if (adjEntry.outwardQty > 0 && effectiveGrnStock === Number(g.qty || 0)) {
            effectiveGrnStock = Math.max(0, effectiveGrnStock - adjEntry.outwardQty);
          }
        }
        if (effectiveGrnStock > 0 && !seenBarcodes.has(bcKey)) {
          seenBarcodes.add(bcKey);
          merged.push({
            source: 'grn',
            id: g.id,
            barcode: itemStartBarcode,
            stockQty: Number(effectiveGrnStock.toFixed(4)),
            rate: g.unitPrice || 0,
            uom: g.unit || 'Nos'
          });
        }
      }
    }
  });

  adjMap.forEach((entry, bcKey) => {
    if (entry.stockQty > 0 && !seenBarcodes.has(bcKey)) {
      seenBarcodes.add(bcKey);
      merged.push({
        source: entry.source,
        id: entry.id,
        barcode: entry.barcode,
        stockQty: Number(entry.stockQty.toFixed(4)),
        rate: entry.rate,
        uom: entry.uom
      });
    }
  });

  return merged;
};

export const deductBarcodeStock = async (db, { partNo, barcode, qty, source, sourceId }) => {
  const issueQty = Number(qty || 0);
  if (!partNo || isNaN(issueQty) || issueQty <= 0) {
    throw new BadRequestError('Valid partNo and qty > 0 are required to deduct stock');
  }

  const cleanPartNo = String(partNo).trim();
  const cleanBarcode = barcode ? String(barcode).trim() : '';
  if (!cleanBarcode || cleanBarcode.startsWith('DIRECT-')) {
    throw new BadRequestError(`Valid barcode with available stock is required for part ${cleanPartNo}`);
  }

  let updatedStockQty = null;

  await db.$transaction(async (tx) => {
    // 1. Lookup matching gRNDetail by sourceId or (itemCode + barcode)
    let grnDet = null;
    if (source === 'grn' && sourceId && Number(sourceId) > 0) {
      grnDet = await tx.gRNDetail.findUnique({ where: { id: Number(sourceId) } });
    }
    if (!grnDet) {
      grnDet = await tx.gRNDetail.findFirst({
        where: {
          itemCode: { equals: cleanPartNo, mode: 'insensitive' },
          barcode: { equals: cleanBarcode, mode: 'insensitive' },
          stockQty: { gt: 0 }
        },
        orderBy: { id: 'asc' }
      });
    }

    // 2. Lookup matching INWARD stockAdjustment by sourceId or (partNo + barcode)
    let adj = null;
    if (source === 'adjustment' && sourceId && Number(sourceId) > 0) {
      adj = await tx.stockAdjustment.findUnique({ where: { id: Number(sourceId) } });
    }
    if (!adj) {
      adj = await tx.stockAdjustment.findFirst({
        where: {
          partNo: { equals: cleanPartNo, mode: 'insensitive' },
          barcode: { equals: cleanBarcode, mode: 'insensitive' },
          type: 'INWARD',
          qty: { gt: 0 }
        },
        orderBy: { id: 'asc' }
      });
    }

    // Determine available stock from the primary source
    const grnAvail = grnDet ? Number(grnDet.stockQty || 0) : null;
    const adjAvail = adj ? Number(adj.qty || 0) : null;
    const availableStock = source === 'grn' && grnAvail !== null
      ? grnAvail
      : source === 'adjustment' && adjAvail !== null
        ? adjAvail
        : (grnAvail !== null ? grnAvail : (adjAvail !== null ? adjAvail : 0));

    if ((!grnDet && !adj) || availableStock <= 0) {
      throw new BadRequestError(`Stock is not available for part ${cleanPartNo} against barcode ${cleanBarcode} (Available: 0). Stock cannot be negative.`);
    }

    if (issueQty > availableStock) {
      throw new BadRequestError(`Insufficient stock for part ${cleanPartNo} against barcode ${cleanBarcode}. Available: ${availableStock}, Issue Qty: ${issueQty}. Stock cannot be negative.`);
    }

    if (grnDet && Number(grnDet.stockQty) > 0) {
      if (Number(grnDet.stockQty) < issueQty && source === 'grn') {
        throw new BadRequestError(`Insufficient GRN stock for part ${cleanPartNo} (Barcode: ${cleanBarcode}). Available: ${grnDet.stockQty}, Issue Qty: ${issueQty}.`);
      }
      const newStock = Number(grnDet.stockQty) - issueQty;
      if (newStock >= 0) {
        await tx.gRNDetail.updateMany({
          where: { id: grnDet.id },
          data: {
            stockQty: newStock,
            version: { increment: 1 }
          }
        });
        updatedStockQty = newStock;
      }
    }

    if (adj && Number(adj.qty) > 0) {
      if (Number(adj.qty) < issueQty && source === 'adjustment') {
        throw new BadRequestError(`Insufficient stock for part ${cleanPartNo} (Barcode: ${cleanBarcode}). Available: ${adj.qty}, Issue Qty: ${issueQty}.`);
      }
      const newAdjQty = Math.max(0, Number(adj.qty) - issueQty);
      const unitPrice = Number(adj.price || 0);
      await tx.stockAdjustment.updateMany({
        where: { id: adj.id },
        data: {
          qty: newAdjQty,
          amount: Number((newAdjQty * unitPrice).toFixed(2)),
          version: { increment: 1 }
        }
      });
      if (updatedStockQty === null) {
        updatedStockQty = newAdjQty;
      }
    }
  });

  eventBus.publish(SOCKET_EVENTS.STOCK_UPDATED, {
    partNo: cleanPartNo,
    barcode: cleanBarcode,
    stockQty: updatedStockQty ?? 0,
    referenceType: 'MaterialIssueGridDeduct'
  });

  return {
    partNo: cleanPartNo,
    barcode: cleanBarcode,
    deductedQty: issueQty,
    remainingStock: updatedStockQty
  };
};

export const restoreBarcodeStock = async (db, { partNo, barcode, qty, source, sourceId }) => {
  const restoreQty = Number(qty || 0);
  if (!partNo || isNaN(restoreQty) || restoreQty <= 0) {
    throw new BadRequestError('Valid partNo and qty > 0 are required to restore stock');
  }

  const cleanPartNo = String(partNo).trim();
  const cleanBarcode = barcode ? String(barcode).trim() : '';
  let updatedStockQty = null;

  await db.$transaction(async (tx) => {
    // 1. Restore to gRNDetail if matched by sourceId or (itemCode + barcode)
    let grnDet = null;
    if (source === 'grn' && sourceId && Number(sourceId) > 0) {
      grnDet = await tx.gRNDetail.findUnique({ where: { id: Number(sourceId) } });
    }
    if (!grnDet && cleanBarcode && !cleanBarcode.startsWith('DIRECT-')) {
      grnDet = await tx.gRNDetail.findFirst({
        where: {
          itemCode: { equals: cleanPartNo, mode: 'insensitive' },
          barcode: { equals: cleanBarcode, mode: 'insensitive' }
        },
        orderBy: { id: 'desc' }
      });
    }

    if (grnDet) {
      const newStock = Number(grnDet.stockQty || 0) + restoreQty;
      await tx.gRNDetail.updateMany({
        where: { id: grnDet.id },
        data: {
          stockQty: newStock,
          version: { increment: 1 }
        }
      });
      updatedStockQty = newStock;
    }

    // 2. Also restore to matching INWARD stockAdjustment
    let adj = null;
    if (source === 'adjustment' && sourceId && Number(sourceId) > 0) {
      adj = await tx.stockAdjustment.findUnique({ where: { id: Number(sourceId) } });
    }
    if (!adj && cleanBarcode && !cleanBarcode.startsWith('DIRECT-')) {
      adj = await tx.stockAdjustment.findFirst({
        where: {
          partNo: { equals: cleanPartNo, mode: 'insensitive' },
          barcode: { equals: cleanBarcode, mode: 'insensitive' },
          type: 'INWARD'
        },
        orderBy: { id: 'desc' }
      });
    }

    if (adj) {
      const newAdjQty = Number(adj.qty || 0) + restoreQty;
      const unitPrice = Number(adj.price || 0);
      await tx.stockAdjustment.updateMany({
        where: { id: adj.id },
        data: {
          qty: newAdjQty,
          amount: Number((newAdjQty * unitPrice).toFixed(2)),
          version: { increment: 1 }
        }
      });
      if (updatedStockQty === null) {
        updatedStockQty = newAdjQty;
      }
    }
  });

  eventBus.publish(SOCKET_EVENTS.STOCK_UPDATED, {
    partNo: cleanPartNo,
    barcode: cleanBarcode,
    stockQty: updatedStockQty ?? 0,
    referenceType: 'MaterialIssueGridRestore'
  });

  return {
    partNo: cleanPartNo,
    barcode: cleanBarcode,
    restoredQty: restoreQty,
    remainingStock: updatedStockQty
  };
};

export const createIssue = async (db, data, userContext = null) => {
  const { header, details } = data;
  const detailsToProcess = (details || []).filter(d => !d.stockUpdated && !d.stockDeducted);

  if (detailsToProcess.length === 0) {
    throw new BadRequestError("All items in the list have already had their stock updated.");
  }

  const result = await db.$transaction(async (tx) => {
    // Find or create header
    let headerRecord = await tx.materialIssueHeader.findUnique({
      where: { issueNo: header.issueNo }
    });
    if (!headerRecord) {
      const parsedDate = header.issueDate ? new Date(header.issueDate) : new Date();
      const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

      headerRecord = await tx.materialIssueHeader.create({
        data: {
          issueNo: header.issueNo,
          issueDate: validDate,
          department: header.department || null,
          remarks: header.remarks || null,
          model: header.model || null,
          inchargeName: header.inchargeName || null,
          receiverName: header.receiverName || null,
          customerName: header.customerName || null,
          customerCode: header.customerCode || null
        }
      });
    }

    const createdDetails = [];

    for (const detail of detailsToProcess) {
      const issuedQty = Number(detail.currentIssuedQty ?? detail.qty ?? 1);
      let barcodeVal = detail.barcode ? String(detail.barcode).trim() : '';

      // Resolve available barcodes for this part inside transaction (handles offset GRN barcodes & adjustments)
      const partBarcodes = await getBarcodes(tx, detail.partNo);

      if (!barcodeVal || barcodeVal.startsWith('DIRECT-')) {
        const autoBc = partBarcodes.find(b => Number(b.stockQty || 0) >= issuedQty) || partBarcodes.find(b => Number(b.stockQty || 0) > 0);
        if (autoBc && autoBc.barcode) {
          barcodeVal = String(autoBc.barcode).trim();
          if (!detail.source || detail.source === 'direct') detail.source = autoBc.source;
          if (!detail.sourceId) detail.sourceId = autoBc.id;
        }
      }

      if (!barcodeVal || barcodeVal.startsWith('DIRECT-')) {
        throw new BadRequestError(`Stock is not available for part ${detail.partNo}. Please select a valid barcode with available stock.`);
      }

      const matchedBcFromList = partBarcodes.find(
        b => String(b.barcode || '').trim().toLowerCase() === barcodeVal.toLowerCase()
      );

      // 1. Check gRNDetail stock for this part & barcode
      let grnDet = null;
      if (detail.source === 'grn' && detail.sourceId) {
        grnDet = await tx.gRNDetail.findUnique({ where: { id: Number(detail.sourceId) } });
      }
      if (!grnDet && matchedBcFromList?.source === 'grn' && matchedBcFromList?.id) {
        grnDet = await tx.gRNDetail.findUnique({ where: { id: Number(matchedBcFromList.id) } });
      }
      if (!grnDet) {
        grnDet = await tx.gRNDetail.findFirst({
          where: {
            itemCode: { equals: detail.partNo, mode: 'insensitive' },
            barcode: { equals: barcodeVal, mode: 'insensitive' },
            stockQty: { gt: 0 }
          },
          orderBy: { id: 'asc' }
        });
      }

      // 2. Check stockAdjustment net balance (INWARD - OUTWARD) for this part & barcode
      const adjRows = await tx.stockAdjustment.findMany({
        where: {
          partNo: { equals: detail.partNo, mode: 'insensitive' },
          barcode: { equals: barcodeVal, mode: 'insensitive' }
        },
        orderBy: { id: 'asc' }
      });
      const adjNetStock = adjRows.reduce((sum, a) => sum + (a.type === 'INWARD' ? Number(a.qty || 0) : -Number(a.qty || 0)), 0);
      const firstInwardAdj = adjRows.find(a => a.type === 'INWARD') || adjRows[0] || null;

      const grnAvail = grnDet ? Number(grnDet.stockQty || 0) : null;
      const adjAvail = adjRows.length > 0 ? Math.max(0, adjNetStock) : null;
      const bcListAvail = matchedBcFromList ? Number(matchedBcFromList.stockQty || 0) : null;

      const availableStock = detail.source === 'grn' && grnAvail !== null
        ? grnAvail
        : detail.source === 'adjustment' && adjAvail !== null
          ? adjAvail
          : (bcListAvail !== null ? bcListAvail : (grnAvail !== null ? grnAvail : (adjAvail !== null ? adjAvail : 0)));

      if ((!grnDet && adjRows.length === 0 && !matchedBcFromList) || availableStock <= 0) {
        throw new BadRequestError(`Stock is not available for part ${detail.partNo} against barcode ${barcodeVal} (Available: 0). Submission is not allowed.`);
      }

      if (issuedQty > availableStock) {
        throw new BadRequestError(`Insufficient stock for part ${detail.partNo} against barcode ${barcodeVal}. Available: ${availableStock}, Issue Qty: ${issuedQty}. Stock cannot be negative.`);
      }

      // 3. Reduce stockQty in gRNDetail if present
      if (grnDet && Number(grnDet.stockQty) > 0) {
        const newGrnStock = Math.max(0, Number(grnDet.stockQty) - issuedQty);
        await tx.gRNDetail.updateMany({
          where: { id: grnDet.id },
          data: {
            stockQty: newGrnStock,
            version: { increment: 1 }
          }
        });
      }

      // 4. Fetch ItemMaster details for valuation & mapping
      const matchedItem = await tx.itemMaster.findFirst({
        where: { partNo: { equals: detail.partNo, mode: 'insensitive' } },
        select: { id: true, partNo: true, partName: true, purchaseRate: true, rate: true, barcodeType: true }
      });

      const unitPrice = Number(detail.price) || Number(grnDet?.unitPrice) || Number(firstInwardAdj?.price) || Number(matchedBcFromList?.rate) || Number(matchedItem?.purchaseRate) || Number(matchedItem?.rate) || 0;
      const totalAmount = Number(detail.amount) || Number((issuedQty * unitPrice).toFixed(2));
      const resolvedUom = detail.uom || grnDet?.unit || firstInwardAdj?.uom || matchedBcFromList?.uom || 'Nos';
      const rawBType = (matchedItem?.barcodeType || firstInwardAdj?.barcodeType || 'Single').trim();
      const normalizedBType = (rawBType.toLowerCase() === 'multiple' || rawBType.toLowerCase() === 'm') ? 'Multiple' : 'Single';
      const actorName = header.inchargeName || header.receiverName || detail.user || userContext?.userName || 'Admin';
      const vDate = headerRecord.issueDate ? new Date(headerRecord.issueDate) : new Date();

      const jobNoToMatch = detail.serviceJobNo || header.serviceJobNo || '';
      const partNoToMatch = detail.servicePartNo || header.servicePartNo || '';
      const jobMetaTag = jobNoToMatch ? ` [Job:${jobNoToMatch}]` : '';
      const partMetaTag = partNoToMatch ? ` [Part:${partNoToMatch}]` : '';

      // 5. Record OUTWARD entry in stockAdjustment so Stock Management & Stock Report reflect the reduced stock
      await tx.stockAdjustment.create({
        data: {
          partNo: detail.partNo,
          partName: detail.partName || matchedItem?.partName || detail.partNo,
          qty: issuedQty,
          uom: resolvedUom,
          price: unitPrice,
          amount: totalAmount,
          barcode: barcodeVal,
          barcodeType: normalizedBType,
          type: 'OUTWARD',
          remarks: `Material Outward - ${headerRecord.issueNo} - ${detail.partNo} - ${barcodeVal}${jobMetaTag}${partMetaTag}`,
          createdAt: vDate,
          createdBy: actorName,
          updatedBy: actorName
        }
      });

      // 6. Insert Material Outward record into stock_liability_1 for the Stock Management page
      try {
        await tx.$executeRawUnsafe(
          `INSERT INTO stock_liability_1 (
            voucher_type, vourtype, voucher_ref_no, voucher_no, voucher_date,
            item_id, source_item_id, part_no, inward_qty, outward_qty, rate, amount,
            credit_amt, debit_amt, created_by, created_date, status, statues, barcode, old_qty, is_item_matched
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
          )`,
          'Material Outward',
          'Material Outward',
          headerRecord.id,
          headerRecord.issueNo,
          vDate,
          matchedItem?.id || null,
          matchedItem?.id || null,
          detail.partNo,
          0,
          issuedQty,
          unitPrice,
          totalAmount,
          0,
          totalAmount,
          actorName,
          new Date(),
          'A',
          'A',
          barcodeVal,
          availableStock,
          Boolean(matchedItem?.id)
        );
      } catch (liabilityErr) {
        console.warn('stock_liability_1 insert warning in Material Issue:', liabilityErr.message);
      }

      // Find and update ServiceSpareItem if exists, but do not throw error if not found
      const cleanPartNo = partNoToMatch ? partNoToMatch.split(' - ')[0].trim() : '';
      const isUnassigned = (!partNoToMatch || partNoToMatch === '(Unassigned)' || partNoToMatch === 'null');
      
      let bomItem = null;
      if (jobNoToMatch) {
        try {
          const spareWhere = {
            serviceJobNo: { equals: jobNoToMatch, mode: 'insensitive' }
          };
          if (partNoToMatch && !isUnassigned) {
            spareWhere.OR = [
              { servicePartNo: { equals: partNoToMatch, mode: 'insensitive' } },
              { servicePartNo: { startsWith: cleanPartNo, mode: 'insensitive' } },
              { lastSavedAssName: { equals: cleanPartNo, mode: 'insensitive' } },
              { lastSavedAssName: { equals: partNoToMatch, mode: 'insensitive' } }
            ];
          } else {
            spareWhere.OR = [
              { servicePartNo: null },
              { servicePartNo: "" }
            ];
          }

          const matchedSpares = await tx.serviceSpare.findMany({
            where: spareWhere,
            orderBy: { id: 'desc' }
          });

          // Find all matching items across all matched spares
          const allMatchingItems = [];
          for (const sp of matchedSpares) {
            const its = await tx.serviceSpareItem.findMany({
              where: {
                serviceSpareId: sp.id,
                partNo: { equals: detail.partNo, mode: 'insensitive' }
              }
            });
            allMatchingItems.push(...its);
          }

          if (allMatchingItems.length > 0) {
            bomItem = allMatchingItems[0];
            const maxPriorIssued = Math.max(...allMatchingItems.map(it => Number(it.issuedQty || 0)), 0);
            const reqQty = Number(allMatchingItems[0].requiredQty || 0);
            const remainingBal = Math.max(0, reqQty - maxPriorIssued);

            // If item came from ServiceSpareEntry (where issuedQty was already pre-filled) or remainingBal < issuedQty,
            // keep issuedQty capped at reqQty without throwing a false-positive conflict error
            const rawNewIssued = (detail.fromServiceSpare || remainingBal < issuedQty)
              ? Math.max(maxPriorIssued, issuedQty)
              : maxPriorIssued + issuedQty;
            const newIssuedQty = reqQty > 0 ? Math.min(reqQty, rawNewIssued) : rawNewIssued;
            const newBalanceQty = Math.max(0, reqQty - newIssuedQty);

            // Synchronize all matching serviceSpareItem rows across all matching spares
            for (const item of allMatchingItems) {
              await tx.serviceSpareItem.update({
                where: { id: item.id },
                data: {
                  issuedQty: newIssuedQty,
                  balanceQty: newBalanceQty,
                  version: { increment: 1 }
                }
              });
            }
          } else {
            // Check parent part matching if not found
            let parentPartNo = '';
            let parentPartName = '';
            if (partNoToMatch && !isUnassigned) {
              const parts = partNoToMatch.split(' - ');
              parentPartNo = parts[0].trim();
              parentPartName = parts[1] ? parts[1].trim() : parentPartNo;
            }

            if (parentPartNo && detail.partNo.toLowerCase() === parentPartNo.toLowerCase()) {
              for (const spare of matchedSpares) {
                const initialRequiredQty = Math.max(1.0, issuedQty);
                const createdParentItem = await tx.serviceSpareItem.create({
                  data: {
                    serviceSpareId: spare.id,
                    partNo: detail.partNo,
                    partName: parentPartName || detail.partName || detail.partNo,
                    requiredQty: initialRequiredQty,
                    issuedQty: issuedQty,
                    balanceQty: Math.max(0, initialRequiredQty - issuedQty),
                    uom: detail.uom || 'Nos'
                  }
                });
                if (!bomItem) bomItem = createdParentItem;
              }
            }
          }
        } catch (bomErr) {
          if (bomErr.statusCode === 400 || bomErr.name === 'BadRequestError' || bomErr instanceof BadRequestError) {
            throw bomErr;
          }
          console.warn(`BOM update warning for part ${detail.partNo}:`, bomErr.message);
        }
      }

      // Quantities calculation
      const reqQty = bomItem ? Number(bomItem.requiredQty || 0) : Number(detail.bomReqQty ?? detail.rQty ?? issuedQty);
      const prevQty = bomItem ? Math.max(0, Number(bomItem.issuedQty || 0) - issuedQty) : Number(detail.prevIssuedQty || 0);
      const totalIssued = Math.max(issuedQty, prevQty + issuedQty);
      const balQty = Math.max(0, reqQty - totalIssued);

      // Create Issue Detail - stored unconditionally in database
      const detailRecord = await tx.materialIssueDetail.create({
        data: {
          headerId: headerRecord.id,
          partNo: detail.partNo,
          partName: detail.partName || detail.partNo,
          barcode: barcodeVal,
          bomReqQty: reqQty,
          prevIssuedQty: prevQty,
          currentIssuedQty: issuedQty,
          updatedIssuedQty: totalIssued,
          updatedBalQty: balQty,
          user: detail.user || userContext?.userName || 'Admin'
        }
      });
      createdDetails.push(detailRecord);
    }

    return { header: headerRecord, details: createdDetails };
  });

  // Post-transaction success: publish business events to Event Bus
  eventBus.publish(SOCKET_EVENTS.MATERIAL_ISSUE_CREATED, {
    issueNo: result.header.issueNo,
    serviceJobNo: header.serviceJobNo,
    createdBy: userContext?.userName || header.inchargeName || 'Admin',
    priority: "Success",
    referenceType: "MaterialIssueHeader",
    referenceId: result.header.id,
    referenceNumber: result.header.issueNo,
    userId: userContext?.userId || null,
    username: userContext?.email || null,
    actorContext: userContext
  });

  for (const det of result.details) {
    eventBus.publish(SOCKET_EVENTS.STOCK_UPDATED, {
      partNo: det.partNo,
      stockQty: det.updatedBalQty,
      referenceType: "MaterialIssueDetail",
      referenceId: det.id,
      referenceNumber: result.header.issueNo,
      userId: userContext?.userId || null,
      username: userContext?.email || null,
      actorContext: userContext
    });
  }

  return result;
};

export const getAllIssues = async (db, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [headers, total] = await Promise.all([
    db.materialIssueHeader.findMany({
      skip,
      take: limit,
      include: {
        details: true
      },
      orderBy: { issueDate: 'desc' }
    }),
    db.materialIssueHeader.count()
  ]);

  const data = headers.map(h => ({
    id: h.id,
    issueNo: h.issueNo,
    issueDate: h.issueDate,
    department: h.department,
    remarks: h.remarks,
    model: h.model,
    inchargeName: h.inchargeName,
    receiverName: h.receiverName,
    customerName: h.customerName,
    customerCode: h.customerCode,
    createdAt: h.createdAt,
    items: h.details.map(d => ({
      id: d.id,
      partNo: d.partNo,
      partName: d.partName,
      barcode: d.barcode,
      qty: d.currentIssuedQty,
      rate: 0,
      uom: 'Nos'
    }))
  }));
  return { data, total, page, limit };
};

export const getBarcodeDetails = async (db, barcode) => {
  // 1. Search in GRNDetail
  const grnDet = await db.gRNDetail.findFirst({
    where: {
      barcode: { equals: barcode, mode: 'insensitive' }
    },
    include: {
      grn: true
    }
  });

  if (grnDet) {
    const item = await db.itemMaster.findFirst({
      where: { partNo: { equals: grnDet.itemCode, mode: 'insensitive' } }
    });
    return {
      partNo: grnDet.itemCode,
      partName: grnDet.itemName || item?.partName || '',
      spec: grnDet.description || item?.description || '',
      brand: item?.brand || '',
      uom: grnDet.unit || item?.uom || 'PCS',
      rate: grnDet.unitPrice || item?.rate || item?.purchaseRate || 0,
      availableStock: grnDet.stockQty,
      stockLocation: item?.location || '',
      mGrade: item?.materialGradeName || '',
      hrc: item?.remark || '',
      weight: item?.weight || '',
      barcodeType: item?.barcodeType || 'Single',
      source: 'grn',
      sourceId: grnDet.id
    };
  }

  // 2. Search in StockAdjustment
  const adj = await db.stockAdjustment.findFirst({
    where: {
      barcode: { equals: barcode, mode: 'insensitive' },
      type: 'INWARD'
    }
  });

  if (adj) {
    const item = await db.itemMaster.findFirst({
      where: { partNo: { equals: adj.partNo, mode: 'insensitive' } }
    });
    return {
      partNo: adj.partNo,
      partName: adj.partName || item?.partName || '',
      spec: adj.remarks || item?.description || '',
      brand: item?.brand || '',
      uom: adj.uom || item?.uom || 'PCS',
      rate: adj.price || item?.rate || item?.purchaseRate || 0,
      availableStock: adj.qty,
      stockLocation: item?.location || '',
      mGrade: item?.materialGradeName || '',
      hrc: item?.remark || '',
      weight: item?.weight || '',
      barcodeType: adj.barcodeType || item?.barcodeType || 'Single',
      source: 'adjustment',
      sourceId: adj.id
    };
  }

  return null;
};

export const getIssuedItems = async (db, servicePartNo, serviceJobNo) => {
  const cleanPartNo = servicePartNo ? servicePartNo.split(' - ')[0].trim() : '';
  const spareWhere = {};
  if (serviceJobNo) {
    spareWhere.serviceJobNo = { equals: serviceJobNo, mode: 'insensitive' };
  }
  if (servicePartNo) {
    spareWhere.OR = [
      { servicePartNo: { equals: servicePartNo, mode: 'insensitive' } },
      { servicePartNo: { startsWith: cleanPartNo, mode: 'insensitive' } },
      { lastSavedAssName: { equals: cleanPartNo, mode: 'insensitive' } },
      { lastSavedAssName: { equals: servicePartNo, mode: 'insensitive' } }
    ];
  } else {
    spareWhere.OR = [
      { servicePartNo: null },
      { servicePartNo: "" }
    ];
  }

  const serviceSpares = await db.serviceSpare.findMany({
    where: spareWhere,
    include: {
      items: {
        orderBy: { id: 'asc' }
      }
    },
    orderBy: { id: 'desc' }
  });

  if (serviceSpares.length === 0) {
    return [];
  }

  // Aggregate items across matching service spares where issuedQty > 0
  const itemMap = new Map();
  for (const spare of serviceSpares) {
    if (Array.isArray(spare.items)) {
      for (const item of spare.items) {
        const key = item.partNo?.trim().toLowerCase();
        if (!key) continue;
        const iQty = Number(item.issuedQty || 0);
        if (iQty <= 0) continue;

        if (!itemMap.has(key)) {
          itemMap.set(key, {
            id: item.id,
            partNo: item.partNo,
            partName: item.partName,
            qty: iQty,
            rQty: Number(item.requiredQty || 0),
            uom: item.uom || 'Nos',
            customerCode: spare.customerCode || '',
            serviceJobNo: spare.serviceJobNo || serviceJobNo || '',
            servicePartNo: spare.servicePartNo || servicePartNo || '',
            spareCreatedAt: spare.createdAt
          });
        } else {
          const existing = itemMap.get(key);
          if (iQty > existing.qty) {
            existing.qty = iQty;
          }
          if (spare.createdAt && (!existing.spareCreatedAt || new Date(spare.createdAt) < new Date(existing.spareCreatedAt))) {
            existing.spareCreatedAt = spare.createdAt;
          }
        }
      }
    }
  }

  const partNos = Array.from(itemMap.keys());
  if (partNos.length === 0) {
    return [];
  }

  const distinctPartNos = Array.from(itemMap.values()).map(it => it.partNo);

  // Fetch itemMaster, materialIssueDetail (with header), and outward stockAdjustments to determine stock updation status
  const [itemMasters, issueDetails, outwardAdjustments] = await Promise.all([
    db.itemMaster.findMany({
      where: {
        partNo: { in: distinctPartNos }
      },
      select: { partNo: true, rate: true, purchaseRate: true, size: true, routeCardNo: true, brand: true }
    }),
    db.materialIssueDetail.findMany({
      where: {
        partNo: { in: distinctPartNos }
      },
      include: {
        header: true
      },
      orderBy: { id: 'desc' },
      take: 200
    }),
    db.stockAdjustment.findMany({
      where: {
        partNo: { in: distinctPartNos },
        type: 'OUTWARD'
      },
      orderBy: { id: 'desc' },
      take: 200
    })
  ]);

  const itemMasterMap = new Map();
  itemMasters.forEach(im => {
    if (im.partNo) itemMasterMap.set(im.partNo.toLowerCase(), im);
  });

  const results = [];
  for (const it of itemMap.values()) {
    const pKey = it.partNo.toLowerCase();
    const im = itemMasterMap.get(pKey);
    const spec = im?.size || im?.routeCardNo || '';
    const jobTag = it.serviceJobNo ? `[job:${it.serviceJobNo.toLowerCase()}]` : '';

    // 1. Check if an explicit Material Outward stockAdjustment exists for this job + part
    const matchedJobAdj = jobTag
      ? outwardAdjustments.find(a =>
          a.partNo?.toLowerCase() === pKey &&
          String(a.remarks || '').toLowerCase().includes(jobTag)
        )
      : null;

    // 2. Check if a MaterialIssueDetail exists for this spare/job
    const matchedDet = issueDetails.find(d => {
      if (d.partNo?.toLowerCase() !== pKey) return false;
      const bc = String(d.barcode || '').trim();
      if (!bc || bc.startsWith('DIRECT-')) return false;
      if (matchedJobAdj) return true;

      // Check if this detail belongs to a different tagged job in stockAdjustment
      const detIssueNo = d.header?.issueNo ? d.header.issueNo.toLowerCase() : '';
      if (detIssueNo) {
        const adjForIssue = outwardAdjustments.find(a =>
          a.partNo?.toLowerCase() === pKey &&
          String(a.remarks || '').toLowerCase().includes(detIssueNo)
        );
        if (adjForIssue) {
          const remLower = String(adjForIssue.remarks || '').toLowerCase();
          if (remLower.includes('[job:') && jobTag && !remLower.includes(jobTag)) {
            return false;
          }
        }
      }

      if (it.spareCreatedAt && d.createdAt && new Date(d.createdAt) < new Date(it.spareCreatedAt)) {
        return false;
      }
      if (it.customerCode && d.header?.customerCode && d.header.customerCode.toLowerCase() !== it.customerCode.toLowerCase()) {
        return false;
      }
      return true;
    });

    const isStockUpdated = Boolean(matchedJobAdj || matchedDet);

    if (isStockUpdated) {
      const unitPrice = Number(matchedJobAdj?.price) || Number(im?.purchaseRate) || Number(im?.rate) || 0;
      const barcode = matchedJobAdj?.barcode || matchedDet?.barcode || '';
      results.push({
        id: `saved-${it.id}`,
        customerCode: it.customerCode,
        barcode,
        partNo: it.partNo,
        partName: it.partName,
        spec,
        qty: it.qty,
        uom: it.uom,
        price: unitPrice,
        amount: unitPrice * it.qty,
        source: 'grn',
        sourceId: 0,
        serviceJobNo: it.serviceJobNo,
        servicePartNo: it.servicePartNo,
        fromServiceSpare: true,
        stockUpdated: true,
        stockStatus: 'Stock Updated',
        isSaved: true
      });
    } else {
      // Stock not yet updated in Material Issue - resolve first available stock barcode for submission
      const bcs = await getBarcodes(db, it.partNo);
      const firstAvailBc = bcs.find(b => Number(b.stockQty || 0) >= it.qty) || bcs.find(b => Number(b.stockQty || 0) > 0) || bcs[0] || null;
      const unitPrice = Number(firstAvailBc?.rate) || Number(im?.purchaseRate) || Number(im?.rate) || 0;
      const barcode = firstAvailBc?.barcode || '';

      results.push({
        id: `pending-${it.id}`,
        customerCode: it.customerCode,
        barcode,
        partNo: it.partNo,
        partName: it.partName,
        spec,
        qty: it.qty,
        uom: firstAvailBc?.uom || it.uom || 'Nos',
        price: unitPrice,
        amount: unitPrice * it.qty,
        source: firstAvailBc?.source || 'direct',
        sourceId: firstAvailBc?.id ?? 0,
        availableStock: Number(firstAvailBc?.stockQty || 0),
        serviceJobNo: it.serviceJobNo,
        servicePartNo: it.servicePartNo,
        fromServiceSpare: true,
        stockUpdated: false,
        stockStatus: 'Pending',
        isSaved: false
      });
    }
  }

  return results;
};


