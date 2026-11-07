export const getAll = async (db, { search = '', partNo = '' } = {}) => {
  let where = {};
  if (partNo && partNo.trim()) {
    const p = partNo.trim();
    where = {
      partNo: { equals: p, mode: 'insensitive' },
    };
  } else if (search && search.trim()) {
    where = {
      OR: [
        { docNo: { contains: search, mode: 'insensitive' } },
        { partNo: { contains: search, mode: 'insensitive' } },
        { partName: { contains: search, mode: 'insensitive' } },
        { rmChar: { contains: search, mode: 'insensitive' } },
        { checkMethod: { contains: search, mode: 'insensitive' } },
        { specification: { contains: search, mode: 'insensitive' } },
        { specType: { contains: search, mode: 'insensitive' } },
        { createdBy: { contains: search, mode: 'insensitive' } },
      ],
    };
  }
  let records = await db.qCInspectionChar.findMany({ where, orderBy: { id: 'asc' } });

  // If exact query returned 0, try exact punctuation-normalized match against all records
  if (partNo && partNo.trim() && records.length === 0) {
    const all = await db.qCInspectionChar.findMany({ orderBy: { id: 'asc' } });
    const cleanP = partNo.trim().replace(/[\s\-_]/g, '').toLowerCase();
    records = all.filter(r => {
      const cleanR = String(r.partNo || '').replace(/[\s\-_]/g, '').toLowerCase();
      return cleanR === cleanP;
    });
  }

  // Strictly filter by exact partNo (prevent substring/partial matching leakage)
  if (partNo && partNo.trim()) {
    const cleanP = partNo.trim().replace(/[\s\-_]/g, '').toLowerCase();
    records = records.filter(r => {
      const cleanR = String(r.partNo || '').replace(/[\s\-_]/g, '').toLowerCase();
      return cleanR === cleanP;
    });
  }

  records.sort((a, b) => {
    const aOrder = a.orderNo ? parseInt(a.orderNo, 10) : 9999;
    const bOrder = b.orderNo ? parseInt(b.orderNo, 10) : 9999;
    if (!isNaN(aOrder) && !isNaN(bOrder) && aOrder !== bOrder) return aOrder - bOrder;
    return a.id - b.id;
  });
  return records;
};

export const getById = (db, id) =>
  db.qCInspectionChar.findUnique({ where: { id } });

export const create = (db, data) =>
  db.qCInspectionChar.create({ data });

export const update = (db, id, data) =>
  db.qCInspectionChar.update({ where: { id }, data });

export const remove = (db, id) =>
  db.qCInspectionChar.delete({ where: { id } });
