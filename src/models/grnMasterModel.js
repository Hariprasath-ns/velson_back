const getFinancialYear = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const y1 = month >= 4 ? year : year - 1;
  return `${String(y1).slice(-2)}-${String(y1 + 1).slice(-2)}`;
};

export const getNextGRNNo = async (db) => {
  const fy = getFinancialYear();
  const pattern = `${fy}/GRN%`;
  const rows = await db.$queryRaw`
    SELECT "grnNo" FROM grn_master
    WHERE "grnNo" LIKE ${pattern}
    ORDER BY "grnNo" DESC
    LIMIT 1
  `;
  if (rows.length > 0) {
    const prefix = `${fy}/GRN`;
    const seq = parseInt(rows[0].grnNo.replace(prefix, ''), 10);
    return { grnNo: `${prefix}${String(seq + 1).padStart(5, '0')}`, financialYear: fy };
  }
  return { grnNo: `${fy}/GRN00001`, financialYear: fy };
};

export const getAllGRNEntries = (db) =>
  db.gRNMaster.findMany({
    orderBy: { createdAt: 'desc' },
    include: { details: { orderBy: { slNo: 'asc' } } },
  });

export const getGRNEntryById = (db, id) =>
  db.gRNMaster.findUnique({
    where: { id },
    include: { details: { orderBy: { slNo: 'asc' } } },
  });

const TX_OPTS = { maxWait: 10000, timeout: 20000 };

export const createGRNEntry = (db, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    const master = await tx.gRNMaster.create({ data: headerData });
    if (detailRows.length > 0) {
      await tx.gRNDetail.createMany({
        data: detailRows.map((r, i) => ({ ...r, grnId: master.id, slNo: i + 1 })),
      });
    }
    return tx.gRNMaster.findUnique({
      where: { id: master.id },
      include: { details: { orderBy: { slNo: 'asc' } } },
    });
  }, TX_OPTS);

export const updateGRNEntry = (db, id, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    await tx.gRNDetail.deleteMany({ where: { grnId: id } });
    await tx.gRNMaster.update({ where: { id }, data: headerData });
    if (detailRows.length > 0) {
      await tx.gRNDetail.createMany({
        data: detailRows.map((r, i) => ({ ...r, grnId: id, slNo: i + 1 })),
      });
    }
    return tx.gRNMaster.findUnique({
      where: { id },
      include: { details: { orderBy: { slNo: 'asc' } } },
    });
  }, TX_OPTS);

export const deleteGRNEntry = (db, id) =>
  db.gRNMaster.delete({ where: { id } });
