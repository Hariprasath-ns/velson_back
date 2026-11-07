export const getAll = async (db, { search = '', grnNo = '', approvalStatus = '' } = {}) => {
  const where = {};
  if (grnNo) {
    where.grnNo = grnNo;
  }
  if (approvalStatus) {
    where.approvalStatus = approvalStatus;
  }
  if (search) {
    where.OR = [
      { qcNo: { contains: search, mode: 'insensitive' } },
      { grnNo: { contains: search, mode: 'insensitive' } },
      { itemCode: { contains: search, mode: 'insensitive' } },
      { itemName: { contains: search, mode: 'insensitive' } },
      { supplierName: { contains: search, mode: 'insensitive' } },
      { qcStatus: { contains: search, mode: 'insensitive' } },
      { approvalStatus: { contains: search, mode: 'insensitive' } },
    ];
  }

  return db.qCEntryAgainstGRN.findMany({
    where,
    orderBy: { id: 'desc' },
  });
};

export const getById = (db, id) =>
  db.qCEntryAgainstGRN.findUnique({ where: { id } });

export const create = (db, data) =>
  db.qCEntryAgainstGRN.create({ data });

export const update = (db, id, data) =>
  db.qCEntryAgainstGRN.update({ where: { id }, data });

export const remove = (db, id) =>
  db.qCEntryAgainstGRN.delete({ where: { id } });

/**
 * Returns all GRNs that contain items whose QC Type is Quality in Item Master (or GRN detail).
 * Also attaches supplier address from Supplier Master for convenience.
 */
export const getGrnWithQualityItems = async (db) => {
  // 1. Identify Quality QC reference ID(s)
  const qualityRefs = await db.referenceMaster.findMany({
    where: {
      referenceType: 'QC_Type',
      description: { equals: 'QUALITY', mode: 'insensitive' }
    },
    select: { id: true }
  });
  const qualityRefIds = qualityRefs.map(r => r.id);

  // 2. Find partNos in Item Master that have Quality QC Type
  const qualityItems = await db.itemMaster.findMany({
    where: {
      qcTypeId: { in: qualityRefIds }
    },
    select: {
      partNo: true,
      partName: true,
      unitId: true,
      qcTypeId: true
    }
  });

  const qualityPartNoSet = new Set(qualityItems.map(i => i.partNo?.toUpperCase()));

  // 3. Fetch GRNs with their details (generated only by GRN Entry page)
  const grns = await db.gRNMaster.findMany({
    where: {
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
    },
    orderBy: { id: 'desc' },
    include: {
      details: {
        orderBy: { slNo: 'asc' }
      }
    }
  });

  // 4. Fetch supplier addresses for mapping
  const suppliers = await db.supplierMaster.findMany({
    select: {
      supplierName: true,
      address: true,
      address2: true,
      city: true,
      state: true,
      pinCode: true,
    }
  });
  const supplierAddressMap = {};
  suppliers.forEach(s => {
    if (s.supplierName) {
      const parts = [s.address, s.address2, s.city, s.state, s.pinCode].filter(Boolean);
      supplierAddressMap[s.supplierName.toUpperCase()] = parts.join(', ');
    }
  });

  // 5. Filter GRNs that contain at least one Quality item
  const validGrns = [];
  for (const grn of grns) {
    const matchingDetails = (grn.details || []).filter(detail => {
      const codeUpper = (detail.itemCode || '').toUpperCase();
      const isQualityInMaster = qualityPartNoSet.has(codeUpper);
      const isQualityInDetail = (detail.qcType || '').toUpperCase() === 'QUALITY';
      return isQualityInMaster || isQualityInDetail;
    });

    if (matchingDetails.length > 0) {
      const supKey = (grn.supplierName || '').toUpperCase();
      const address = supplierAddressMap[supKey] || '';

      // Group details by itemCode to consolidate total quantity and all individual barcodes
      const itemGroupMap = new Map();
      for (const d of matchingDetails) {
        const key = (d.itemCode || '').trim().toUpperCase();
        if (!itemGroupMap.has(key)) {
          itemGroupMap.set(key, {
            id: d.id,
            slNo: d.slNo,
            itemCode: d.itemCode,
            itemName: d.itemName,
            unit: d.unit,
            totalQty: 0,
            qcType: d.qcType || 'QUALITY',
            barcodes: [],
          });
        }
        const itemObj = itemGroupMap.get(key);
        const rowQty = Number(d.qty) || 0;
        itemObj.totalQty += rowQty;
        if (d.barcode) {
          const existing = itemObj.barcodes.find(b => b.barcode === d.barcode);
          if (!existing) {
            itemObj.barcodes.push({
              barcode: d.barcode,
              qty: rowQty,
              detailId: d.id,
            });
          }
        }
      }

      const qualityItems = Array.from(itemGroupMap.values()).map(item => ({
        ...item,
        qty: item.totalQty,
        barcode: item.barcodes.length > 0 ? item.barcodes[0].barcode : '',
        allBarcodesStr: item.barcodes.map(b => b.barcode).join(', '),
      }));

      validGrns.push({
        id: grn.id,
        grnNo: grn.grnNo,
        grnDate: grn.grnDate ? grn.grnDate.toISOString().slice(0, 10) : '',
        grnType: grn.grnType || '',
        invoiceNo: grn.invoiceNo || '',
        invoiceDate: grn.invoiceDate ? grn.invoiceDate.toISOString().slice(0, 10) : '',
        supplierName: grn.supplierName || '',
        supplierAddress: address,
        qualityItems,
      });
    }
  }

  return validGrns;
};
