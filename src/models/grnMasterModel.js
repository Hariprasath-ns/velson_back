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

const getYYYYMMDD = (date) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

const TX_OPTS = { maxWait: 10000, timeout: 20000 };

export const createGRNEntry = (db, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    const dateStr = getYYYYMMDD(headerData.grnDate);
    const lastEntry = await tx.gRNMaster.findFirst({
      where: {
        grnbarcode: {
          startsWith: dateStr,
        },
      },
      orderBy: {
        grnbarcode: 'desc',
      },
    });

    let nextSeq = 1;
    if (lastEntry && lastEntry.grnbarcode) {
      const lastSeqStr = lastEntry.grnbarcode.slice(-3);
      const lastSeq = parseInt(lastSeqStr, 10);
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1;
      }
    }
    const grnbarcode = `${dateStr}${String(nextSeq).padStart(3, '0')}`;

    const master = await tx.gRNMaster.create({
      data: {
        ...headerData,
        grnbarcode,
      },
    });
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
    const existing = await tx.gRNMaster.findUnique({ where: { id } });
    let grnbarcode = existing.grnbarcode;
    if (!grnbarcode) {
      const dateStr = getYYYYMMDD(headerData.grnDate || existing.grnDate);
      const lastEntry = await tx.gRNMaster.findFirst({
        where: {
          grnbarcode: {
            startsWith: dateStr,
          },
        },
        orderBy: {
          grnbarcode: 'desc',
        },
      });

      let nextSeq = 1;
      if (lastEntry && lastEntry.grnbarcode) {
        const lastSeqStr = lastEntry.grnbarcode.slice(-3);
        const lastSeq = parseInt(lastSeqStr, 10);
        if (!isNaN(lastSeq)) {
          nextSeq = lastSeq + 1;
        }
      }
      grnbarcode = `${dateStr}${String(nextSeq).padStart(3, '0')}`;
    }

    await tx.gRNDetail.deleteMany({ where: { grnId: id } });
    await tx.gRNMaster.update({
      where: { id },
      data: {
        ...headerData,
        grnbarcode,
      },
    });
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
