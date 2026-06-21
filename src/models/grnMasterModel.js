const getFinancialYear = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const y1 = month >= 4 ? year : year - 1;
  return `${String(y1).slice(-2)}-${String(y1 + 1).slice(-2)}`;
};

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

const expandDetailRows = (detailRows, grnbarcode, barcodeTypeMap) => {
  const expanded = [];
  let barcodeOffset = 0;

  detailRows.forEach(row => {
    const type = (barcodeTypeMap[row.itemCode] || 'Single').toLowerCase();
    if (type === 'multiple') {
      const qty = Math.floor(row.qty || 0);
      if (qty > 0) {
        const singleUnitPrice = row.unitPrice || 0;
        const singleTotal = singleUnitPrice;
        const singleDiscAmt = (row.discAmt || 0) / qty;
        const singleFinalPrice = singleTotal - singleDiscAmt;
        const singleNetAmt = singleFinalPrice * (1 + (row.taxPer || 0) / 100);

        for (let j = 0; j < qty; j++) {
          const bc = getOffsetBarcode(grnbarcode, barcodeOffset + j);
          expanded.push({
            ...row,
            qty: 1.0,
            stockQty: 1.0,
            total: singleTotal,
            discAmt: singleDiscAmt,
            finalPrice: singleFinalPrice,
            netAmt: singleNetAmt,
            barcode: bc,
          });
        }
        barcodeOffset += qty;
      }
    } else {
      const bc = getOffsetBarcode(grnbarcode, barcodeOffset);
      expanded.push({
        ...row,
        barcode: bc,
      });
      barcodeOffset += 1;
    }
  });

  return expanded;
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

export const getAllGRNEntries = async (db) => {
  const entries = await db.gRNMaster.findMany({
    orderBy: { createdAt: 'desc' },
    include: { details: { orderBy: { slNo: 'asc' } } },
  });
  const items = await db.itemMaster.findMany({
    select: { partNo: true, barcodeType: true },
  });
  const barcodeTypeMap = {};
  items.forEach(item => {
    if (item.partNo) {
      barcodeTypeMap[item.partNo] = item.barcodeType || 'Single';
    }
  });
  return entries.map(entry => ({
    ...entry,
    details: (entry.details || []).map(detail => ({
      ...detail,
      barcodeType: barcodeTypeMap[detail.itemCode] || 'Single',
    })),
  }));
};

export const getGRNEntryById = async (db, id) => {
  const entry = await db.gRNMaster.findUnique({
    where: { id },
    include: { details: { orderBy: { slNo: 'asc' } } },
  });
  if (!entry) return null;
  const items = await db.itemMaster.findMany({
    select: { partNo: true, barcodeType: true },
  });
  const barcodeTypeMap = {};
  items.forEach(item => {
    if (item.partNo) {
      barcodeTypeMap[item.partNo] = item.barcodeType || 'Single';
    }
  });
  return {
    ...entry,
    details: (entry.details || []).map(detail => ({
      ...detail,
      barcodeType: barcodeTypeMap[detail.itemCode] || 'Single',
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
    const lastEntry = await tx.gRNMaster.findFirst({
      where: {
        grnbarcode: {
          startsWith: dateStr,
        },
      },
      include: {
        details: true,
      },
      orderBy: {
        grnbarcode: 'desc',
      },
    });

    const items = await tx.itemMaster.findMany({
      select: { partNo: true, barcodeType: true },
    });
    const barcodeTypeMap = {};
    items.forEach(item => {
      if (item.partNo) {
        barcodeTypeMap[item.partNo] = item.barcodeType || 'Single';
      }
    });

    let nextSeq = 1;
    if (lastEntry && lastEntry.grnbarcode) {
      const lastSeqStr = lastEntry.grnbarcode.slice(dateStr.length);
      const lastSeq = parseInt(lastSeqStr, 10);
      if (!isNaN(lastSeq)) {
        let totalConsumed = 0;
        (lastEntry.details || []).forEach(d => {
          const type = (barcodeTypeMap[d.itemCode] || 'Single').toLowerCase();
          if (type === 'multiple') {
            totalConsumed += Math.floor(d.qty || 0);
          } else {
            totalConsumed += 1;
          }
        });
        if (totalConsumed === 0) totalConsumed = 1;
        nextSeq = lastSeq + totalConsumed;
      }
    }
    const grnbarcode = `${dateStr}${String(nextSeq).padStart(3, '0')}`;

    const master = await tx.gRNMaster.create({
      data: {
        ...headerData,
        grnbarcode,
      },
    });
    const expandedDetails = expandDetailRows(detailRows, grnbarcode, barcodeTypeMap);
    if (expandedDetails.length > 0) {
      await tx.gRNDetail.createMany({
        data: expandedDetails.map((r, i) => ({ ...r, grnId: master.id, slNo: i + 1 })),
      });
    }
    return tx.gRNMaster.findUnique({
      where: { id: master.id },
      include: { details: { orderBy: { slNo: 'asc' } } },
    });
  }, TX_OPTS);

export const updateGRNEntry = (db, id, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    const existing = await tx.gRNMaster.findUnique({ where: { id } });
    let grnbarcode = existing.grnbarcode;
    if (!grnbarcode) {
      const dateStr = getYYYYMMDD(headerData.grnDate || existing.grnDate);
      const lastEntry = await tx.gRNMaster.findFirst({
        where: {
          grnbarcode: {
            startsWith: dateStr,
          },
        },
        include: {
          details: true,
        },
        orderBy: {
          grnbarcode: 'desc',
        },
      });

      const items = await tx.itemMaster.findMany({
        select: { partNo: true, barcodeType: true },
      });
      const barcodeTypeMap = {};
      items.forEach(item => {
        if (item.partNo) {
          barcodeTypeMap[item.partNo] = item.barcodeType || 'Single';
        }
      });

      let nextSeq = 1;
      if (lastEntry && lastEntry.grnbarcode) {
        const lastSeqStr = lastEntry.grnbarcode.slice(dateStr.length);
        const lastSeq = parseInt(lastSeqStr, 10);
        if (!isNaN(lastSeq)) {
          let totalConsumed = 0;
          (lastEntry.details || []).forEach(d => {
            const type = (barcodeTypeMap[d.itemCode] || 'Single').toLowerCase();
            if (type === 'multiple') {
              totalConsumed += Math.floor(d.qty || 0);
            } else {
              totalConsumed += 1;
            }
          });
          if (totalConsumed === 0) totalConsumed = 1;
          nextSeq = lastSeq + totalConsumed;
        }
      }
      grnbarcode = `${dateStr}${String(nextSeq).padStart(3, '0')}`;
    }

    await tx.gRNDetail.deleteMany({ where: { grnId: id } });
    await tx.gRNMaster.update({
      where: { id },
      data: {
        ...headerData,
        grnbarcode,
      },
    });
    const items = await tx.itemMaster.findMany({
      select: { partNo: true, barcodeType: true },
    });
    const barcodeTypeMap = {};
    items.forEach(item => {
      if (item.partNo) {
        barcodeTypeMap[item.partNo] = item.barcodeType || 'Single';
      }
    });
    const expandedDetails = expandDetailRows(detailRows, grnbarcode, barcodeTypeMap);
    if (expandedDetails.length > 0) {
      await tx.gRNDetail.createMany({
        data: expandedDetails.map((r, i) => ({ ...r, grnId: id, slNo: i + 1 })),
      });
    }
    return tx.gRNMaster.findUnique({
      where: { id },
      include: { details: { orderBy: { slNo: 'asc' } } },
    });
  }, TX_OPTS);

export const deleteGRNEntry = (db, id) =>
  db.gRNMaster.delete({ where: { id } });
