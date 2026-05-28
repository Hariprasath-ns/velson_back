export const getPartUsageLists = async (db, { search = '' } = {}) => {
  const where = search
    ? {
        OR: [
          { partNo:   { contains: search, mode: 'insensitive' } },
          { partName: { contains: search, mode: 'insensitive' } },
          { group:    { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};
  return db.partUsageList.findMany({ where, orderBy: { id: 'desc' } });
};

export const getPartUsageListById = (db, id) =>
  db.partUsageList.findUnique({ where: { id } });

export const createPartUsageList = (db, data) =>
  db.partUsageList.create({ data });

export const updatePartUsageList = (db, id, data) =>
  db.partUsageList.update({ where: { id }, data });

export const deletePartUsageList = (db, id) =>
  db.partUsageList.delete({ where: { id } });
