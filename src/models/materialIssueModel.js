const getFinancialYear = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const y1 = month >= 4 ? year : year - 1;
  return `${String(y1).slice(-2)}-${String(y1 + 1).slice(-2)}`;
};

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
  const whereClause = {
    serviceSpare: {
      serviceJobNo: {
        equals: serviceJobNo,
        mode: 'insensitive'
      },
      ...(servicePartNo ? {
        servicePartNo: {
          equals: servicePartNo,
          mode: 'insensitive'
        }
      } : {
        OR: [
          { servicePartNo: null },
          { servicePartNo: "" }
        ]
      })
    },
    balanceQty: {
      gt: 0
    }
  };

  return db.serviceSpareItem.findMany({
    where: whereClause,
    orderBy: { id: 'asc' }
  });
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
        select: { grnbarcode: true }
      }
    }
  });

  const adjustmentBarcodes = await db.stockAdjustment.findMany({
    where: {
      partNo: {
        equals: partNo,
        mode: 'insensitive'
      },
      type: 'INWARD',
      qty: { gt: 0 }
    }
  });

  const merged = [];
  grnBarcodes.forEach(g => {
    if (g.grn && g.grn.grnbarcode) {
      merged.push({
        source: 'grn',
        id: g.id,
        barcode: g.grn.grnbarcode,
        stockQty: g.stockQty,
        rate: g.unitPrice || 0,
        uom: g.unit || 'Nos'
      });
    }
  });

  adjustmentBarcodes.forEach(a => {
    if (a.barcode) {
      merged.push({
        source: 'adjustment',
        id: a.id,
        barcode: a.barcode,
        stockQty: a.qty,
        rate: a.price || 0,
        uom: a.uom || 'Nos'
      });
    }
  });

  return merged;
};

export const createIssue = async (db, data) => {
  const { header, details } = data;
  return db.$transaction(async (tx) => {
    // Find or create header
    let headerRecord = await tx.materialIssueHeader.findUnique({
      where: { issueNo: header.issueNo }
    });
    if (!headerRecord) {
      headerRecord = await tx.materialIssueHeader.create({
        data: {
          issueNo: header.issueNo,
          issueDate: new Date(header.issueDate),
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

    for (const detail of details) {
      // Deduct stock
      if (detail.source === 'grn') {
        const grnDet = await tx.gRNDetail.findUnique({ where: { id: detail.sourceId } });
        if (!grnDet || grnDet.stockQty < detail.currentIssuedQty) {
          throw new Error(`Insufficient GRN stock for barcode ${detail.barcode}. Available: ${grnDet?.stockQty || 0}`);
        }
        await tx.gRNDetail.update({
          where: { id: detail.sourceId },
          data: { stockQty: grnDet.stockQty - detail.currentIssuedQty }
        });
      } else if (detail.source === 'adjustment') {
        const adj = await tx.stockAdjustment.findUnique({ where: { id: detail.sourceId } });
        if (!adj || adj.qty < detail.currentIssuedQty) {
          throw new Error(`Insufficient stock adjustment stock for barcode ${detail.barcode}. Available: ${adj?.qty || 0}`);
        }
        await tx.stockAdjustment.update({
          where: { id: detail.sourceId },
          data: { qty: adj.qty - detail.currentIssuedQty }
        });
      }

      // Find and update ServiceSpareItem
      const isUnassigned = (!header.servicePartNo || header.servicePartNo === '(Unassigned)' || header.servicePartNo === 'null');
      const bomItem = await tx.serviceSpareItem.findFirst({
        where: {
          partNo: {
            equals: detail.partNo,
            mode: 'insensitive'
          },
          serviceSpare: {
            serviceJobNo: {
              equals: header.serviceJobNo,
              mode: 'insensitive'
            },
            ...(isUnassigned ? {
              OR: [
                { servicePartNo: null },
                { servicePartNo: "" }
              ]
            } : {
              servicePartNo: {
                equals: header.servicePartNo,
                mode: 'insensitive'
              }
            })
          }
        }
      });
      if (!bomItem) {
        throw new Error(`BOM item ${detail.partNo} not found for Job ${header.serviceJobNo} and Part ${header.servicePartNo}`);
      }

      const newIssuedQty = bomItem.issuedQty + detail.currentIssuedQty;
      const newBalanceQty = bomItem.requiredQty - newIssuedQty;
      if (newIssuedQty > bomItem.requiredQty) {
        throw new Error(`Issue quantity of ${newIssuedQty} exceeds required quantity of ${bomItem.requiredQty}`);
      }

      await tx.serviceSpareItem.update({
        where: { id: bomItem.id },
        data: {
          issuedQty: newIssuedQty,
          balanceQty: newBalanceQty
        }
      });

      // Create Issue Detail
      const detailRecord = await tx.materialIssueDetail.create({
        data: {
          headerId: headerRecord.id,
          partNo: detail.partNo,
          partName: detail.partName,
          barcode: detail.barcode,
          bomReqQty: bomItem.requiredQty,
          prevIssuedQty: bomItem.issuedQty,
          currentIssuedQty: detail.currentIssuedQty,
          updatedIssuedQty: newIssuedQty,
          updatedBalQty: newBalanceQty,
          user: detail.user || 'Admin'
        }
      });
      createdDetails.push(detailRecord);
    }

    return { header: headerRecord, details: createdDetails };
  });
};
