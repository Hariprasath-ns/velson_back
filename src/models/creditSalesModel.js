export const getNextCreditSalesBillNo = async (db) => {
  const rows = await db.$queryRaw`
    SELECT "billNo" FROM credit_sales
    ORDER BY id DESC
    LIMIT 1
  `;
  if (rows.length > 0) {
    const lastBill = rows[0].billNo;
    const seq = parseInt(lastBill, 10);
    if (isNaN(seq)) {
      return { billNo: String(seq + 1).padStart(3, '0') };
    }
    return { billNo: String(seq + 1).padStart(3, '0') };
  }
  return { billNo: '001' };
};

export const getAllCreditSales = async (db, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    db.creditSales.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { details: { orderBy: { slNo: 'asc' } } }
    }),
    db.creditSales.count()
  ]);
  return { data, total, page, limit };
};

export const getCreditSaleById = (db, id) =>
  db.creditSales.findUnique({
    where: { id },
    include: { details: { orderBy: { slNo: 'asc' } } }
  });

const TX_OPTS = { maxWait: 10000, timeout: 20000 };

export const createCreditSale = (db, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    const master = await tx.creditSales.create({ data: headerData });
    if (detailRows.length > 0) {
      const dbDetailRows = detailRows.map((row) => ({
        ...row,
        creditSalesId: master.id
      }));
      await tx.creditSalesDetail.createMany({
        data: dbDetailRows
      });
    }
    return tx.creditSales.findUnique({
      where: { id: master.id },
      include: { details: { orderBy: { slNo: 'asc' } } }
    });
  }, TX_OPTS);

export const updateCreditSale = (db, id, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    await tx.creditSalesDetail.deleteMany({
      where: { creditSalesId: id }
    });

    const master = await tx.creditSales.update({
      where: { id },
      data: headerData
    });

    if (detailRows.length > 0) {
      const dbDetailRows = detailRows.map((row) => ({
        ...row,
        creditSalesId: master.id
      }));
      await tx.creditSalesDetail.createMany({
        data: dbDetailRows
      });
    }

    return tx.creditSales.findUnique({
      where: { id: master.id },
      include: { details: { orderBy: { slNo: 'asc' } } }
    });
  }, TX_OPTS);

export const deleteCreditSale = (db, id) =>
  db.creditSales.delete({
    where: { id }
  });
