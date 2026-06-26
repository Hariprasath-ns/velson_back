export const getNextServiceBillRefNo = async (db) => {
  const rows = await db.$queryRaw`
    SELECT "refNo" FROM service_bill
  `;
  const usedNums = new Set();
  for (const r of rows) {
    if (r.refNo) {
      const num = parseInt(r.refNo, 10);
      if (!isNaN(num)) {
        usedNums.add(num);
      }
    }
  }
  let nextNum = 1;
  while (usedNums.has(nextNum)) {
    nextNum++;
  }
  return { refNo: String(nextNum) };
};

export const getAllServiceBills = (db) =>
  db.serviceBill.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: { orderBy: { slNo: 'asc' } } }
  });

export const getServiceBillById = (db, id) =>
  db.serviceBill.findUnique({
    where: { id },
    include: { items: { orderBy: { slNo: 'asc' } } }
  });

const TX_OPTS = { maxWait: 10000, timeout: 20000 };

export const createServiceBill = (db, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    const master = await tx.serviceBill.create({ data: headerData });
    if (detailRows && detailRows.length > 0) {
      const dbDetailRows = detailRows.map((row) => ({
        ...row,
        serviceBillId: master.id
      }));
      await tx.serviceBillItem.createMany({
        data: dbDetailRows
      });
    }
    return tx.serviceBill.findUnique({
      where: { id: master.id },
      include: { items: { orderBy: { slNo: 'asc' } } }
    });
  }, TX_OPTS);

export const updateServiceBill = (db, id, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    await tx.serviceBillItem.deleteMany({
      where: { serviceBillId: id }
    });

    const master = await tx.serviceBill.update({
      where: { id },
      data: headerData
    });

    if (detailRows && detailRows.length > 0) {
      const dbDetailRows = detailRows.map((row) => ({
        ...row,
        serviceBillId: master.id
      }));
      await tx.serviceBillItem.createMany({
        data: dbDetailRows
      });
    }

    return tx.serviceBill.findUnique({
      where: { id: master.id },
      include: { items: { orderBy: { slNo: 'asc' } } }
    });
  }, TX_OPTS);

export const deleteServiceBill = (db, id) =>
  db.serviceBill.delete({
    where: { id }
  });
