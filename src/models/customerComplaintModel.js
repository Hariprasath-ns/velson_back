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
  const records = await db.customerComplaint.findMany({
    where: {
      ccNo: {
        startsWith: prefix
      }
    },
    select: { ccNo: true }
  });

  let maxSeq = 0;
  for (const r of records) {
    if (r.ccNo && r.ccNo.startsWith(prefix)) {
      const suffix = r.ccNo.slice(prefix.length);
      const num = parseInt(suffix, 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
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
