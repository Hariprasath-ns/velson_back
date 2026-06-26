const getFinancialYear = () => {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const y1 = month >= 4 ? year : year - 1
  return `${String(y1).slice(-2)}-${String(y1 + 1).slice(-2)}`
}

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

export const getAllQuotations = (db) =>
  db.quotationSales.findMany({
    orderBy: { createdAt: 'desc' },
    include: { customer: { select: { id: true, customerName: true, cCode: true } }, details: { orderBy: { slNo: 'asc' } } },
  })

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
