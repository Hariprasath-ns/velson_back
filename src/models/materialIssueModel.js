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

  const items = await db.serviceSpareItem.findMany({
    where: whereClause,
    orderBy: { id: 'asc' }
  });

  // Find the serviceSpare to see if we need to dynamically append the parent servicePartNo
  const serviceSpare = await db.serviceSpare.findFirst({
    where: {
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
    }
  });

  if (serviceSpare && serviceSpare.servicePartNo) {
    const parts = serviceSpare.servicePartNo.split(' - ');
    const parentPartNo = parts[0].trim();
    const parentPartName = parts[1] ? parts[1].trim() : parentPartNo;

    if (parentPartNo) {
      // Check if the parent part is already in the items list
      const hasParent = items.some(item => item.partNo.toLowerCase() === parentPartNo.toLowerCase());
      if (!hasParent) {
        // Find if a ServiceSpareItem already exists for this parent part but with balanceQty = 0
        const existingParentItem = await db.serviceSpareItem.findFirst({
          where: {
            serviceSpareId: serviceSpare.id,
            partNo: {
              equals: parentPartNo,
              mode: 'insensitive'
            }
          }
        });

        // If it doesn't exist, we append a virtual one so it shows up
        if (!existingParentItem) {
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
  }

  return items;
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
      },
      type: 'INWARD',
      qty: { gt: 0 }
    }
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

  const issuedDetails = await db.materialIssueDetail.findMany({
    where: {
      partNo: {
        equals: partNo,
        mode: 'insensitive'
      }
    },
    select: { barcode: true }
  });
  const issuedBarcodes = new Set(issuedDetails.map(id => id.barcode.toLowerCase()));

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

  grnBarcodes.forEach(g => {
    if (g.grn && g.grn.grnbarcode) {
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
        const numericPart = itemStartBarcode.match(/\d+$/);
        for (let j = 0; j < totalQty; j++) {
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

          if (!issuedBarcodes.has(bc.toLowerCase())) {
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
        if (!issuedBarcodes.has(itemStartBarcode.toLowerCase())) {
          merged.push({
            source: 'grn',
            id: g.id,
            barcode: itemStartBarcode,
            stockQty: g.stockQty,
            rate: g.unitPrice || 0,
            uom: g.unit || 'Nos'
          });
        }
      }
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
      let bomItem = await tx.serviceSpareItem.findFirst({
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
        // If the item doesn't exist, check if detail.partNo matches the parent servicePartNo
        let parentPartNo = '';
        let parentPartName = '';
        if (header.servicePartNo && header.servicePartNo !== '(Unassigned)' && header.servicePartNo !== 'null') {
          const parts = header.servicePartNo.split(' - ');
          parentPartNo = parts[0].trim();
          parentPartName = parts[1] ? parts[1].trim() : parentPartNo;
        }

        if (parentPartNo && detail.partNo.toLowerCase() === parentPartNo.toLowerCase()) {
          // Find the serviceSpare record to link the item to
          const serviceSpare = await tx.serviceSpare.findFirst({
            where: {
              serviceJobNo: {
                equals: header.serviceJobNo,
                mode: 'insensitive'
              },
              servicePartNo: {
                equals: header.servicePartNo,
                mode: 'insensitive'
              }
            }
          });

          if (serviceSpare) {
            // Dynamically create the ServiceSpareItem record
            const initialRequiredQty = Math.max(1.0, detail.currentIssuedQty);
            bomItem = await tx.serviceSpareItem.create({
              data: {
                serviceSpareId: serviceSpare.id,
                partNo: detail.partNo,
                partName: parentPartName || detail.partName,
                requiredQty: initialRequiredQty,
                issuedQty: 0.0,
                balanceQty: initialRequiredQty,
                uom: detail.uom || 'Nos'
              }
            });
          }
        }
      }

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
