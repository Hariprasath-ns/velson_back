export const getItemMasters = async (db, { page = 1, limit = 10, search = '' }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const where = search
    ? {
      OR: [
        { partName: { contains: search, mode: 'insensitive' } },
        { partNo: { contains: search, mode: 'insensitive' } },
        { outsourcePartNo: { contains: search, mode: 'insensitive' } },
      ],
    }
    : {};
  const [items, total] = await Promise.all([
    db.itemMaster.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { id: 'desc' },
      omit: { imageData: true, pdfData: true },
      include: {
        uploads: {
          omit: { imageData: true, pdfData: true }
        }
      }
    }),
    db.itemMaster.count({ where }),
  ]);

  const unitIds = [...new Set(items.map(i => i.unitId).filter(Boolean))];
  const gradeIds = [...new Set(items.map(i => i.materialGradeId).filter(Boolean))];
  const qcIds = [...new Set(items.map(i => i.qcTypeId).filter(Boolean))];
  const taxIds = [...new Set(items.map(i => i.taxId).filter(Boolean))];
  const itemTypeIds = [...new Set(items.map(i => i.itemTypeId).filter(Boolean))];
  const modelIds = [...new Set(items.map(i => i.modelId).filter(Boolean))];

  let uomMap = {};
  let gradeMap = {};
  let qcMap = {};
  let taxMap = {};
  let itemTypeMap = {};
  let modelMap = {};

  if (unitIds.length > 0) {
    const uomRows = await db.referenceMaster.findMany({
      where: { id: { in: unitIds } },
      select: { id: true, description: true },
    });
    uomMap = Object.fromEntries(uomRows.map(r => [r.id, r.description]));
  }

  if (gradeIds.length > 0) {
    const gradeRows = await db.referenceMaster.findMany({
      where: { id: { in: gradeIds } },
      select: { id: true, description: true },
    });
    gradeMap = Object.fromEntries(gradeRows.map(r => [r.id, r.description]));
  }

  if (qcIds.length > 0) {
    const qcRows = await db.referenceMaster.findMany({
      where: { id: { in: qcIds } },
      select: { id: true, description: true, code: true },
    });
    qcMap = Object.fromEntries(qcRows.map(r => [r.id, r.description || r.code]));
  }

  if (taxIds.length > 0) {
    const taxRows = await db.taxMaster.findMany({
      where: { id: { in: taxIds } },
      select: { id: true, taxPercent: true, cgstTax: true, sgstTax: true, igstTax: true },
    });
    taxMap = Object.fromEntries(taxRows.map(r => [r.id, r]));
  }

  if (itemTypeIds.length > 0) {
    const itemTypeRows = await db.referenceMaster.findMany({
      where: { id: { in: itemTypeIds } },
      select: { id: true, description: true },
    });
    itemTypeMap = Object.fromEntries(itemTypeRows.map(r => [r.id, r.description]));
  }

  if (modelIds.length > 0) {
    const modelRows = await db.referenceMaster.findMany({
      where: { id: { in: modelIds } },
      select: { id: true, description: true, code: true },
    });
    modelMap = Object.fromEntries(modelRows.map(r => [r.id, r.description || r.code]));
  }

  const data = items.map(i => {
    const taxObj = i.taxId ? taxMap[i.taxId] : null;
    return {
      ...i,
      uom: i.unitId ? (uomMap[i.unitId] ?? '') : '',
      modelName: i.modelId ? (modelMap[i.modelId] ?? '') : '',
      materialGradeName: i.materialGradeId ? (gradeMap[i.materialGradeId] ?? '') : '',
      qcTypeName: i.qcTypeId ? (qcMap[i.qcTypeId] ?? '') : '',
      itemTypeName: i.itemTypeId ? (itemTypeMap[i.itemTypeId] ?? '') : '',
      tax: taxObj || null,
      taxPercent: taxObj?.taxPercent ?? null,
      gstPer: taxObj?.taxPercent ?? null,
      hasImage: !!i.imageMimeType || (i.uploads && i.uploads.some(u => u.imageMimeType)),
      hasPdf: !!i.pdfMimeType || (i.uploads && i.uploads.some(u => u.pdfMimeType)),
    };
  });
  return { data, total };
};

export const getItemMasterById = async (db, id) => {
  const item = await db.itemMaster.findUnique({ where: { id } });
  if (!item) return null;
  if (item.qcTypeId) {
    const ref = await db.referenceMaster.findUnique({
      where: { id: item.qcTypeId },
      select: { description: true, code: true }
    });
    if (ref) {
      item.qcTypeName = ref.description || ref.code;
    }
  }
  if (item.taxId) {
    const tax = await db.taxMaster.findUnique({
      where: { id: item.taxId },
      select: { id: true, taxPercent: true, cgstTax: true, sgstTax: true, igstTax: true }
    });
    if (tax) {
      item.tax = tax;
      item.taxPercent = tax.taxPercent;
      item.gstPer = tax.taxPercent;
    }
  }
  return item;
};

export const createItemMaster = (db, data) =>
  db.itemMaster.create({ data });

export const updateItemMaster = (db, id, data) =>
  db.itemMaster.update({ where: { id }, data });

export const deleteItemMaster = (db, id) =>
  db.itemMaster.delete({ where: { id } });

export const createUpload = (db, data) =>
  db.itemMasterUpload.create({ data });

export const getUploadsByItemId = async (db, itemId) => {
  const uploads = await db.itemMasterUpload.findMany({
    where: { itemId },
    orderBy: { id: 'asc' },
    omit: { imageData: true, pdfData: true }
  });
  return uploads.map(u => ({
    ...u,
    hasImage: !!u.imageMimeType,
    hasPdf: !!u.pdfMimeType
  }));
};

export const getUploadById = (db, id) =>
  db.itemMasterUpload.findUnique({ where: { id } });
