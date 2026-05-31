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
      omit: { imageData: true, pdfData: true }
    }),
    db.itemMaster.count({ where }),
  ]);

  const unitIds = [...new Set(items.map(i => i.unitId).filter(Boolean))];
  const gradeIds = [...new Set(items.map(i => i.materialGradeId).filter(Boolean))];

  let uomMap = {};
  let gradeMap = {};

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

  const data = items.map(i => ({
    ...i,
    uom:               i.unitId          ? (uomMap[i.unitId]      ?? '') : '',
    materialGradeName: i.materialGradeId ? (gradeMap[i.materialGradeId] ?? '') : '',
    hasImage:          !!i.imageMimeType,
    hasPdf:            !!i.pdfMimeType,
  }));
  return { data, total };
};

export const getItemMasterById = (db, id) =>
  db.itemMaster.findUnique({ where: { id } });

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
