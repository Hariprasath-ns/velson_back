export const getAllComplaints = async (db, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    db.customerComplaint.findMany({
      skip,
      take: limit,
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
    }),
    db.customerComplaint.count()
  ]);
  return { data, total, page, limit };
};

export const getComplaintById = (db, id) =>
  db.customerComplaint.findUnique({
    where: { id },
    include: { images: true }
  });

export const getNextCCNo = async (db, yearStr) => {
  const prefix = `${yearStr}/CC`;
  const likePattern = `${prefix}%`;
  const regexPattern = `^${prefix}[0-9]+$`;
  const startIndex = prefix.length + 1;

  const rows = await db.$queryRaw`
    SELECT "ccNo" FROM customer_complaint
    WHERE "ccNo" LIKE ${likePattern} AND "ccNo" ~ ${regexPattern}
    ORDER BY CAST(SUBSTRING("ccNo" FROM ${startIndex}) AS INTEGER) DESC
    LIMIT 1
  `;
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
