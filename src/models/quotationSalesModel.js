import { getFinancialYear } from "../utils/date.js";

export const getNextQuotationNo = async (db) => {
  const fy = getFinancialYear()
  const pattern = `${fy}/QS%`
  const rows = await db.$queryRaw`
    SELECT "quotationNo" FROM quotation_sales
    WHERE "quotationNo" LIKE ${pattern}
    ORDER BY "quotationNo" DESC
    LIMIT 1
  `
  if (rows.length > 0) {
    const prefix = `${fy}/QS`
    const seq = parseInt(rows[0].quotationNo.replace(prefix, ''), 10)
    return { quotationNo: `${prefix}${String(seq + 1).padStart(5, '0')}`, financialYear: fy }
  }
  return { quotationNo: `${fy}/QS00001`, financialYear: fy }
}

export const getAllQuotations = async (db, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    db.quotationSales.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { id: true, customerName: true, cCode: true } }, details: { orderBy: { slNo: 'asc' } } },
    }),
    db.quotationSales.count()
  ]);
  return { data, total, page, limit };
};

export const getQuotationById = (db, id) =>
  db.quotationSales.findUnique({
    where: { id },
    include: { customer: true, details: { orderBy: { slNo: 'asc' } } },
  })

const TX_OPTS = { maxWait: 10000, timeout: 20000 }

export const createQuotation = (db, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    const master = await tx.quotationSales.create({ data: headerData })
    if (detailRows.length > 0) {
      await tx.quotationSalesDetail.createMany({
        data: detailRows.map((r, i) => ({ ...r, quotationSalesId: master.id, slNo: i + 1 })),
      })
    }
    return tx.quotationSales.findUnique({
      where: { id: master.id },
      include: { customer: true, details: { orderBy: { slNo: 'asc' } } },
    })
  }, TX_OPTS)

export const updateQuotation = (db, id, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    await tx.quotationSalesDetail.deleteMany({ where: { quotationSalesId: id } })
    await tx.quotationSales.update({ where: { id }, data: headerData })
    if (detailRows.length > 0) {
      await tx.quotationSalesDetail.createMany({
        data: detailRows.map((r, i) => ({ ...r, quotationSalesId: id, slNo: i + 1 })),
      })
    }
    return tx.quotationSales.findUnique({
      where: { id },
      include: { customer: true, details: { orderBy: { slNo: 'asc' } } },
    })
  }, TX_OPTS)

export const deleteQuotation = (db, id) =>
  db.quotationSales.delete({ where: { id } })
