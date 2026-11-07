import { getFinancialYear } from "../utils/date.js";
import { BadRequestError, NotFoundError } from "../middlewares/customErrors.js";

export const getNextGateNo = async (db) => {
  const fy = getFinancialYear();
  const pattern = `${fy}/GE%`;
  const rows = await db.$queryRaw`
    SELECT "gateEntryNo" FROM gate_master
    WHERE "gateEntryNo" LIKE ${pattern}
    ORDER BY "gateEntryNo" DESC
    LIMIT 1
  `;
  if (rows.length > 0) {
    const prefix = `${fy}/GE`;
    const seq = parseInt(rows[0].gateEntryNo.replace(prefix, ''), 10);
    return { gateEntryNo: `${prefix}${String(seq + 1).padStart(5, '0')}`, financialYear: fy };
  }
  return { gateEntryNo: `${fy}/GE00001`, financialYear: fy };
};

export const getAllGateEntries = async (db, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    db.gateMaster.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { details: { orderBy: { slNo: 'asc' } } },
    }),
    db.gateMaster.count()
  ]);
  return { data, total, page, limit };
};

export const getGateEntryById = (db, id) =>
  db.gateMaster.findUnique({
    where: { id },
    include: { details: { orderBy: { slNo: 'asc' } } },
  });

const TX_OPTS = { maxWait: 10000, timeout: 20000 };

export const syncPoStatusAfterGateEntry = async (tx, poId, poNo) => {
  if (!poId && !poNo) return;
  const po = await tx.purchaseMaster.findFirst({
    where: poId ? { id: poId } : { poNo: poNo },
    include: { details: true }
  });
  if (!po || !po.details || po.details.length === 0) return;

  const allGateEntries = await tx.gateMaster.findMany({
    where: { poNo: po.poNo },
    include: { details: true }
  });

  const recQtyMap = {};
  allGateEntries.forEach(ge => {
    (ge.details || []).forEach(d => {
      if (d.itemCode) {
        recQtyMap[d.itemCode] = (recQtyMap[d.itemCode] || 0) + (d.recQty || 0);
      }
    });
  });

  const totalItems = po.details.length;
  let completedCount = 0;
  let anyReceived = false;

  po.details.forEach(d => {
    const totalRec = recQtyMap[d.itemCode] || 0;
    const ordQ = d.qty || 0;
    if (totalRec >= ordQ && ordQ > 0) {
      completedCount++;
    }
    if (totalRec > 0) {
      anyReceived = true;
    }
  });

  let targetStatus;
  if (totalItems > 0 && completedCount === totalItems) {
    targetStatus = 'Closed';
  } else if (anyReceived) {
    targetStatus = 'Pending';
  } else {
    targetStatus = 'Approval';
  }

  await tx.purchaseMaster.update({
    where: { id: po.id },
    data: { status: targetStatus }
  });
};

export const createGateEntry = (db, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    if (headerData.poNo || headerData.poId) {
      const po = await tx.purchaseMaster.findFirst({
        where: headerData.poId ? { id: headerData.poId } : { poNo: headerData.poNo },
        include: { details: true }
      });
      if (!po) {
        throw new BadRequestError('Selected Purchase Order not found.');
      }
      if ((po.status || '').toLowerCase() === 'closed') {
        throw new BadRequestError(`Purchase Order ${po.poNo} is already Closed and cannot accept further receipts.`);
      }

      const totalRecQty = detailRows.reduce((sum, r) => sum + (parseFloat(r.recQty) || 0), 0);
      if (totalRecQty <= 0) {
        throw new BadRequestError('Received quantity must be greater than zero.');
      }

      const existingGateEntries = await tx.gateMaster.findMany({
        where: { poNo: po.poNo },
        include: { details: true }
      });

      const prevRecMap = {};
      existingGateEntries.forEach(ge => {
        (ge.details || []).forEach(d => {
          if (d.itemCode) {
            prevRecMap[d.itemCode] = (prevRecMap[d.itemCode] || 0) + (d.recQty || 0);
          }
        });
      });

      const poItemMap = {};
      (po.details || []).forEach(d => {
        if (d.itemCode) poItemMap[d.itemCode] = d;
      });

      for (const row of detailRows) {
        const recQ = parseFloat(row.recQty) || 0;
        if (recQ < 0) {
          throw new BadRequestError('Received quantity cannot be negative.');
        }
        if (recQ > 0 && row.itemCode) {
          const poItem = poItemMap[row.itemCode];
          if (poItem) {
            const ordQ = poItem.qty || 0;
            const prevRec = prevRecMap[row.itemCode] || 0;
            const balanceQ = Math.max(0, ordQ - prevRec);
            if (recQ > balanceQ) {
              throw new BadRequestError(
                `Received quantity cannot exceed the remaining quantity. Ordered Qty: ${ordQ}, Previously Received Qty: ${prevRec}, Balance Qty: ${balanceQ}.`
              );
            }
          }
        }
      }
    }

    const master = await tx.gateMaster.create({ data: headerData });
    const validRows = detailRows.filter(r => (parseFloat(r.recQty) || 0) > 0 || r.itemCode);
    if (validRows.length > 0) {
      await tx.gateDetail.createMany({
        data: validRows.map((r, i) => ({ ...r, gateId: master.id, slNo: i + 1 })),
      });
    }
    await syncPoStatusAfterGateEntry(tx, headerData.poId, headerData.poNo);
    return tx.gateMaster.findUnique({
      where: { id: master.id },
      include: { details: { orderBy: { slNo: 'asc' } } },
    });
  }, TX_OPTS);

export const updateGateEntry = (db, id, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    if (headerData.poNo || headerData.poId) {
      const po = await tx.purchaseMaster.findFirst({
        where: headerData.poId ? { id: headerData.poId } : { poNo: headerData.poNo },
        include: { details: true }
      });
      if (!po) {
        throw new BadRequestError('Selected Purchase Order not found.');
      }

      const totalRecQty = detailRows.reduce((sum, r) => sum + (parseFloat(r.recQty) || 0), 0);
      if (totalRecQty <= 0) {
        throw new BadRequestError('Received quantity must be greater than zero.');
      }

      const otherGateEntries = await tx.gateMaster.findMany({
        where: { poNo: po.poNo, id: { not: id } },
        include: { details: true }
      });

      const prevRecMap = {};
      otherGateEntries.forEach(ge => {
        (ge.details || []).forEach(d => {
          if (d.itemCode) {
            prevRecMap[d.itemCode] = (prevRecMap[d.itemCode] || 0) + (d.recQty || 0);
          }
        });
      });

      const poItemMap = {};
      (po.details || []).forEach(d => {
        if (d.itemCode) poItemMap[d.itemCode] = d;
      });

      for (const row of detailRows) {
        const recQ = parseFloat(row.recQty) || 0;
        if (recQ < 0) {
          throw new BadRequestError('Received quantity cannot be negative.');
        }
        if (recQ > 0 && row.itemCode) {
          const poItem = poItemMap[row.itemCode];
          if (poItem) {
            const ordQ = poItem.qty || 0;
            const prevRec = prevRecMap[row.itemCode] || 0;
            const balanceQ = Math.max(0, ordQ - prevRec);
            if (recQ > balanceQ) {
              throw new BadRequestError(
                `Received quantity cannot exceed the remaining quantity. Ordered Qty: ${ordQ}, Previously Received Qty: ${prevRec}, Balance Qty: ${balanceQ}.`
              );
            }
          }
        }
      }
    }

    await tx.gateDetail.deleteMany({ where: { gateId: id } });
    await tx.gateMaster.update({ where: { id }, data: headerData });
    const validRows = detailRows.filter(r => (parseFloat(r.recQty) || 0) > 0 || r.itemCode);
    if (validRows.length > 0) {
      await tx.gateDetail.createMany({
        data: validRows.map((r, i) => ({ ...r, gateId: id, slNo: i + 1 })),
      });
    }
    await syncPoStatusAfterGateEntry(tx, headerData.poId, headerData.poNo);
    return tx.gateMaster.findUnique({
      where: { id },
      include: { details: { orderBy: { slNo: 'asc' } } },
    });
  }, TX_OPTS);

export const deleteGateEntry = (db, id) =>
  db.$transaction(async (tx) => {
    const entry = await tx.gateMaster.findUnique({ where: { id } });
    if (!entry) throw new NotFoundError('Gate entry not found');
    await tx.gateDetail.deleteMany({ where: { gateId: id } });
    await tx.gateMaster.delete({ where: { id } });
    if (entry.poNo || entry.poId) {
      await syncPoStatusAfterGateEntry(tx, entry.poId, entry.poNo);
    }
    return { success: true };
  }, TX_OPTS);
