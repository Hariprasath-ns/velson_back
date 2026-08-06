export const getAll = async (db) => {
  return db.serviceSpare.findMany({
    orderBy: { createdAt: 'asc' },
    include: { items: { orderBy: { id: 'asc' } } }
  });
};

export const create = async (db, data) => {
  const { items, ...rest } = data;
  return db.serviceSpare.create({
    data: {
      ...rest,
      items: items ? {
        create: items.map(item => ({
          partNo: item.partNo,
          partName: item.partName,
          requiredQty: parseFloat(item.requiredQty) || 0,
          issuedQty: parseFloat(item.issuedQty) || 0,
          balanceQty: parseFloat(item.balanceQty) || 0,
          uom: item.uom || 'Nos'
        }))
      } : undefined
    },
    include: { items: true }
  });
};

export const update = async (db, id, data) => {
  const { items, ...rest } = data;
  return db.$transaction(async (tx) => {
    if (items) {
      await tx.serviceSpareItem.deleteMany({ where: { serviceSpareId: id } });
    }
    return tx.serviceSpare.update({
      where: { id },
      data: {
        ...rest,
        items: items ? {
          create: items.map(item => ({
            partNo: item.partNo,
            partName: item.partName,
            requiredQty: parseFloat(item.requiredQty) || 0,
            issuedQty: parseFloat(item.issuedQty) || 0,
            balanceQty: parseFloat(item.balanceQty) || 0,
            uom: item.uom || 'Nos'
          }))
        } : undefined
      },
      include: { items: true }
    });
  });
};

export const remove = async (db, id) => {
  return db.serviceSpare.delete({ where: { id } });
};

