export const getIndexCreationById = async (db, id) => {
  const record = await db.indexCreation.findUnique({
    where: { id },
    include: { excelData: true }
  });
  if (record) {
    record.hasImage = !!record.imageMimeType;
  }
  return record;
};

export const getAllIndexCreations = async (db) => {
  const records = await db.indexCreation.findMany({
    orderBy: { createdAt: 'desc' },
    include: { excelData: true },
    omit: { imageData: true }
  });
  return records.map(r => ({
    ...r,
    hasImage: !!r.imageMimeType
  }));
};

export const createIndexCreation = async (db, data, excelDataPayload) => {
  return await db.$transaction(async (tx) => {
    const record = await tx.indexCreation.create({ data });
    if (excelDataPayload && Array.isArray(excelDataPayload) && excelDataPayload.length > 0) {
      await tx.indexCreationExcelData.create({
        data: {
          indexCreationId: record.id,
          excelData: excelDataPayload
        }
      });
    }
    return await tx.indexCreation.findUnique({
      where: { id: record.id },
      include: { excelData: true }
    });
  });
};

export const updateIndexCreation = async (db, id, data, excelDataPayload) => {
  return await db.$transaction(async (tx) => {
    const record = await tx.indexCreation.update({
      where: { id },
      data
    });
    if (excelDataPayload && Array.isArray(excelDataPayload)) {
      await tx.indexCreationExcelData.upsert({
        where: { indexCreationId: id },
        update: { excelData: excelDataPayload },
        create: { indexCreationId: id, excelData: excelDataPayload }
      });
    }
    return await tx.indexCreation.findUnique({
      where: { id },
      include: { excelData: true }
    });
  });
};

export const deleteIndexCreation = async (db, id) => {
  return await db.indexCreation.delete({
    where: { id }
  });
};

export const createUpload = (db, data) =>
  db.indexCreationUpload.create({ data });

export const getUploadsByIndexId = async (db, indexCreationId) => {
  const uploads = await db.indexCreationUpload.findMany({
    where: { indexCreationId },
    orderBy: { id: 'asc' },
    omit: { imageData: true }
  });
  return uploads.map(u => ({
    ...u,
    hasImage: !!u.imageMimeType
  }));
};

export const getUploadById = (db, id) =>
  db.indexCreationUpload.findUnique({ where: { id } });

