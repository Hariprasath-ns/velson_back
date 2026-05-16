const INCLUDE_RELATIONS = {
  category:    { select: { categoryName: true } },
  subCategory: { select: { subCategoryName: true } },
};

export const getAllPartNumberBases = (db) =>
  db.partNumberBase.findMany({
    include: INCLUDE_RELATIONS,
    orderBy: { createdAt: 'desc' },
  });

export const getPartNumberBaseById = (db, id) =>
  db.partNumberBase.findUnique({ where: { id }, include: INCLUDE_RELATIONS });

export const getActiveByPrefix = (db, prefixCode) =>
  db.partNumberBase.findFirst({
    where: { prefixCode, isActive: true },
  });

export const createPartNumberBase = (db, data) =>
  db.partNumberBase.create({ data, include: INCLUDE_RELATIONS });

export const updatePartNumberBase = (db, id, data) =>
  db.partNumberBase.update({ where: { id }, data, include: INCLUDE_RELATIONS });

export const deletePartNumberBase = (db, id) =>
  db.partNumberBase.delete({ where: { id } });

export const generatePartNumberTx = async (db, prefixCode) => {
  // Only DB reads/writes inside the transaction; formatting done after
  const { digitCount, runningNumber } = await db.$transaction(async (tx) => {
    const record = await tx.partNumberBase.findFirst({
      where: { prefixCode, isActive: true },
    });

    if (!record) {
      throw new Error(`No active PartNumberBase found for prefix "${prefixCode}"`);
    }
    if (record.currentRunningNumber > record.endingNumber) {
      throw new Error(`Part number limit exceeded for selected prefix "${prefixCode}"`);
    }

    await tx.partNumberBase.update({
      where: { id: record.id },
      data: { currentRunningNumber: record.currentRunningNumber + 1 },
    });

    return { digitCount: record.digitCount, runningNumber: record.currentRunningNumber };
  }, { isolationLevel: 'Serializable' });

  const partNumber = prefixCode + String(runningNumber).padStart(digitCount, '0');
  return { partNumber, currentRunningNumber: runningNumber + 1 };
};

export const previewNextPartNumber = async (db, prefixCode) => {
  const record = await db.partNumberBase.findFirst({
    where: { prefixCode, isActive: true },
  });

  if (!record) return null;

  if (record.currentRunningNumber > record.endingNumber) {
    throw new Error(`Part number limit exceeded for prefix "${prefixCode}"`);
  }

  const partNumber =
    prefixCode + String(record.currentRunningNumber).padStart(record.digitCount, '0');

  return { partNumber, remaining: record.endingNumber - record.currentRunningNumber + 1 };
};
