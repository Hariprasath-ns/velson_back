const getFinancialYearDC = () => {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const y1 = month >= 4 ? year : year - 1
  return `${String(y1).slice(-2)}/${String(y1 + 1).slice(-2)}`
}

export const getNextDcNo = async (db) => {
  const fy = getFinancialYearDC() // returns e.g. "26/27"
  const prefix = `${fy}DC`
  const pattern = `${prefix}%`
  const rows = await db.$queryRaw`
    SELECT "dcNo" FROM delivery_challan
    WHERE "dcNo" LIKE ${pattern}
    ORDER BY "dcNo" DESC
    LIMIT 1
  `
  if (rows.length > 0) {
    const lastDcNo = rows[0].dcNo
    const seqStr = lastDcNo.replace(prefix, '')
    const seq = parseInt(seqStr, 10) || 0
    return { dcNo: `${prefix}${String(seq + 1).padStart(4, '0')}`, financialYear: fy }
  }
  return { dcNo: `${prefix}0001`, financialYear: fy }
}

const TX_OPTS = { maxWait: 10000, timeout: 20000 }

export const createDeliveryChallan = (db, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    for (const detail of detailRows) {
      if (detail.barcode && detail.source && detail.sourceId) {
        if (detail.source === 'grn') {
          const grnDet = await tx.gRNDetail.findUnique({ where: { id: detail.sourceId } });
          if (!grnDet || grnDet.stockQty < detail.qty) {
            throw new Error(`Insufficient GRN stock for barcode ${detail.barcode}. Available: ${grnDet?.stockQty || 0}`);
          }
          const updated = await tx.gRNDetail.updateMany({
            where: { id: detail.sourceId, version: grnDet.version },
            data: {
              stockQty: grnDet.stockQty - detail.qty,
              version: { increment: 1 }
            }
          });
          if (updated.count === 0) {
            throw new Error(`Stock was modified concurrently for barcode ${detail.barcode}. Please reload.`);
          }
        } else if (detail.source === 'adjustment') {
          const adj = await tx.stockAdjustment.findUnique({ where: { id: detail.sourceId } });
          if (!adj || adj.qty < detail.qty) {
            throw new Error(`Insufficient stock adjustment stock for barcode ${detail.barcode}. Available: ${adj?.qty || 0}`);
          }
          const updated = await tx.stockAdjustment.updateMany({
            where: { id: detail.sourceId, version: adj.version },
            data: {
              qty: adj.qty - detail.qty,
              version: { increment: 1 }
            }
          });
          if (updated.count === 0) {
            throw new Error(`Stock was modified concurrently for barcode ${detail.barcode}. Please reload.`);
          }
        }
      }
    }

    const master = await tx.deliveryChallan.create({ data: headerData })
    if (detailRows.length > 0) {
      const dbDetailRows = detailRows.map(({ source, sourceId, ...rest }) => ({
        ...rest,
        dcId: master.id
      }));
      await tx.deliveryChallanDetail.createMany({
        data: dbDetailRows,
      })
    }
    return tx.deliveryChallan.findUnique({
      where: { id: master.id },
      include: { customer: true, supplier: true, details: { orderBy: { slNo: 'asc' } } },
    })
  }, TX_OPTS)


export const getRecentDcValues = async (db) => {
  const rows = await db.deliveryChallan.findMany({
    select: {
      vehicleNo: true,
      driverName: true,
      desThrough: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  });

  const vehicles = [...new Set(rows.map((r) => r.vehicleNo).filter(Boolean))];
  const drivers = [...new Set(rows.map((r) => r.driverName).filter(Boolean))];
  const desThroughs = [...new Set(rows.map((r) => r.desThrough).filter(Boolean))];

  return { vehicles, drivers, desThroughs };
};

export const getAllDeliveryChallans = async (db, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    db.deliveryChallan.findMany({
      skip,
      take: limit,
      include: {
        details: true,
      },
      orderBy: {
        date: 'desc',
      },
    }),
    db.deliveryChallan.count()
  ]);
  return { data, total, page, limit };
};
