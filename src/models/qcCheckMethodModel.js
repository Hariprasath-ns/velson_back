export const getAll = async (db, { search = '' } = {}) => {
  const where = search
    ? {
        OR: [
          { checkCode:  { contains: search, mode: 'insensitive' } },
          { checkName:  { contains: search, mode: 'insensitive' } },
          { description:{ contains: search, mode: 'insensitive' } },
        ],
      }
    : {};
  return db.qCCheckMethod.findMany({ where, orderBy: { id: 'desc' } });
};

export const getById = (db, id) =>
  db.qCCheckMethod.findUnique({ where: { id } });

export const create = (db, data) =>
  db.qCCheckMethod.create({ data });

export const update = (db, id, data) =>
  db.qCCheckMethod.update({ where: { id }, data });

export const remove = (db, id) =>
  db.qCCheckMethod.delete({ where: { id } });
