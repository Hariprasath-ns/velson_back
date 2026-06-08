export const getAllComplaints = (db) =>
  db.customerComplaint.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      images: {
        select: {
          id: true,
          name: true,
          imageMimeType: true
        }
      }
    }
  });

export const getComplaintById = (db, id) =>
  db.customerComplaint.findUnique({
    where: { id },
    include: { images: true }
  });

export const getNextCCNo = async (db, yearStr) => {
  const prefix = `${yearStr}/CC`;
  const rows = await db.$queryRawUnsafe(`
    SELECT "ccNo" FROM customer_complaint
    WHERE "ccNo" LIKE '${prefix}%' AND "ccNo" ~ '^${prefix}[0-9]+$'
    ORDER BY CAST(SUBSTRING("ccNo" FROM ${prefix.length + 1}) AS INTEGER) DESC
    LIMIT 1
  `);
  if (rows.length > 0) {
    const lastCcNo = rows[0].ccNo;
    const suffix = lastCcNo.slice(prefix.length);
    const seq = parseInt(suffix, 10) || 0;
    return `${prefix}${String(seq + 1).padStart(4, '0')}`;
  }
  return `${prefix}0001`;
};

export const createComplaint = (db, data) =>
  db.customerComplaint.create({ data });

export const updateComplaint = (db, id, data) =>
  db.customerComplaint.update({ where: { id }, data });

export const deleteComplaint = (db, id) =>
  db.customerComplaint.delete({ where: { id } });

export const addComplaintImage = (db, complaintId, name, imageData, imageMimeType) =>
  db.customerComplaintImage.create({
    data: {
      complaintId,
      name,
      imageData,
      imageMimeType
    }
  });

export const deleteComplaintImage = (db, imageId) =>
  db.customerComplaintImage.delete({ where: { id: imageId } });
