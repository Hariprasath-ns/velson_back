const getFinancialYear = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const y1 = month >= 4 ? year : year - 1;
  return `${String(y1).slice(-2)}-${String(y1 + 1).slice(-2)}`;
};

export const getNextMrNo = async (db) => {
  const fy = getFinancialYear();
  const pattern = `${fy}/MQ%`;
  const rows = await db.$queryRaw`
    SELECT "mrNo" FROM material_request
    WHERE "mrNo" LIKE ${pattern}
    ORDER BY "mrNo" DESC
    LIMIT 1
  `;
  if (rows.length > 0) {
    const prefix = `${fy}/MQ`;
    const seq = parseInt(rows[0].mrNo.replace(prefix, ''), 10);
    return { mrNo: `${prefix}${String(seq + 1).padStart(5, '0')}`, financialYear: fy };
  }
  return { mrNo: `${fy}/MQ00001`, financialYear: fy };
};

const MR_INCLUDE = { details: { orderBy: { slNo: 'asc' } } };

export const getAllMaterialRequests = (db) =>
  db.materialRequest.findMany({ orderBy: { createdAt: 'desc' }, include: MR_INCLUDE });

export const getMaterialRequestById = (db, id) =>
  db.materialRequest.findUnique({ where: { id }, include: MR_INCLUDE });

export const getMaterialRequestByNo = (db, mrNo) =>
  db.materialRequest.findUnique({ where: { mrNo }, include: MR_INCLUDE });

const TX_OPTS = { maxWait: 10000, timeout: 20000 };

export const createMaterialRequest = (db, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    const master = await tx.materialRequest.create({ data: headerData });
    if (detailRows.length > 0) {
      await tx.materialRequestDetail.createMany({
        data: detailRows.map((r, i) => ({ ...r, mrId: master.id, slNo: i + 1 })),
      });
    }
    return tx.materialRequest.findUnique({ where: { id: master.id }, include: MR_INCLUDE });
  }, TX_OPTS);

export const updateMaterialRequest = (db, id, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    await tx.materialRequestDetail.deleteMany({ where: { mrId: id } });
    await tx.materialRequest.update({ where: { id }, data: headerData });
    if (detailRows.length > 0) {
      await tx.materialRequestDetail.createMany({
        data: detailRows.map((r, i) => ({ ...r, mrId: id, slNo: i + 1 })),
      });
    }
    return tx.materialRequest.findUnique({ where: { id }, include: MR_INCLUDE });
  }, TX_OPTS);

export const deleteMaterialRequest = (db, id) =>
  db.materialRequest.delete({ where: { id } });
