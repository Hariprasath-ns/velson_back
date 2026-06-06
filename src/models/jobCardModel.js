const JC_INCLUDE = {
  lineItems: { orderBy: { slNo: 'asc' } },
};

export const getAllJobCards = (db) =>
  db.jobCard.findMany({
    orderBy: { createdAt: 'desc' },
    include: JC_INCLUDE,
  });

export const getJobCardById = (db, id) =>
  db.jobCard.findUnique({
    where: { id },
    include: JC_INCLUDE,
  });

export const getNextJobNo = async (db) => {
  const rows = await db.$queryRaw`
    SELECT "jobNo" FROM job_card
    WHERE "jobNo" ~ '^[0-9]+$'
    ORDER BY "jobNo"::int DESC
    LIMIT 1
  `;
  if (rows.length > 0) {
    const last = parseInt(rows[0].jobNo, 10);
    return String(last + 1);
  }
  return "1";
};

const TX_OPTS = { maxWait: 10000, timeout: 20000 };

export const createJobCard = (db, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    const master = await tx.jobCard.create({ data: headerData });
    if (detailRows.length > 0) {
      await tx.jobCardLineItem.createMany({
        data: detailRows.map((r, i) => ({ ...r, jobCardId: master.id, slNo: i + 1 })),
      });
    }
    return tx.jobCard.findUnique({
      where: { id: master.id },
      include: JC_INCLUDE,
    });
  }, TX_OPTS);

export const updateJobCard = (db, id, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    await tx.jobCardLineItem.deleteMany({ where: { jobCardId: id } });
    await tx.jobCard.update({ where: { id }, data: headerData });
    if (detailRows.length > 0) {
      await tx.jobCardLineItem.createMany({
        data: detailRows.map((r, i) => ({ ...r, jobCardId: id, slNo: i + 1 })),
      });
    }
    return tx.jobCard.findUnique({
      where: { id },
      include: JC_INCLUDE,
    });
  }, TX_OPTS);

export const deleteJobCard = (db, id) =>
  db.jobCard.delete({ where: { id } });
