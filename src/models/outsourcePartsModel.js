const TX_OPTS = { maxWait: 10000, timeout: 20000 };

export const getAllOutsourceParts = async (db) => {
  return db.outsourceParts.findMany({
    include: {
      items: {
        orderBy: { slNo: 'asc' }
      },
      customer: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const getOutsourcePartsById = async (db, id) => {
  return db.outsourceParts.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { slNo: 'asc' }
      },
      customer: true
    }
  });
};

export const createOutsourceParts = async (db, headerData, detailRows) => {
  return db.$transaction(async (tx) => {
    const master = await tx.outsourceParts.create({
      data: headerData
    });
    if (detailRows.length > 0) {
      const dbDetailRows = detailRows.map((row) => ({
        ...row,
        registerId: master.id
      }));
      await tx.outsourcePartsDetail.createMany({
        data: dbDetailRows
      });
    }
    return tx.outsourceParts.findUnique({
      where: { id: master.id },
      include: {
        items: {
          orderBy: { slNo: 'asc' }
        },
        customer: true
      }
    });
  }, TX_OPTS);
};

export const updateOutsourceParts = async (db, id, headerData, detailRows) => {
  return db.$transaction(async (tx) => {
    await tx.outsourceParts.update({
      where: { id },
      data: headerData
    });

    // Delete existing detail rows and recreate them
    await tx.outsourcePartsDetail.deleteMany({
      where: { registerId: id }
    });

    if (detailRows.length > 0) {
      const dbDetailRows = detailRows.map((row) => ({
        ...row,
        registerId: id
      }));
      await tx.outsourcePartsDetail.createMany({
        data: dbDetailRows
      });
    }

    return tx.outsourceParts.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { slNo: 'asc' }
        },
        customer: true
      }
    });
  }, TX_OPTS);
};

export const deleteOutsourceParts = async (db, id) => {
  return db.outsourceParts.delete({
    where: { id }
  });
};
