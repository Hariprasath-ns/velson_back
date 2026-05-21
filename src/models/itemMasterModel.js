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
    db.itemMaster.findMany({ where, skip, take: Number(limit), orderBy: { id: 'desc' } }),
    db.itemMaster.count({ where }),
  ]);

  const unitIds = [...new Set(items.map(i => i.unitId).filter(Boolean))];
  let uomMap = {};
  if (unitIds.length > 0) {
    const uomRows = await db.referenceMaster.findMany({
      where: { id: { in: unitIds }, referenceType: 'UOM' },
      select: { id: true, description: true },
    });
    uomMap = Object.fromEntries(uomRows.map(r => [r.id, r.description]));
  }

  const data = items.map(i => ({ ...i, uom: i.unitId ? (uomMap[i.unitId] ?? '') : '' }));
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

export const getUploadsByItemId = (db, itemId) =>
  db.itemMasterUpload.findMany({ where: { itemId }, orderBy: { id: 'asc' } });
