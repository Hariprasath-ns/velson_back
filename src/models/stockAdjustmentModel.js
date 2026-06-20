const TX_OPTS = { maxWait: 10000, timeout: 20000 };

export const getAllStockAdjustments = (db) =>
  db.stockAdjustment.findMany({
    orderBy: { createdAt: 'desc' },
  });

export const createStockAdjustments = (db, dataArray) => {
  return db.$transaction(async (tx) => {
    // If it's a single object, wrap it in array
    const records = Array.isArray(dataArray) ? dataArray : [dataArray];
    
    // We can insert them using createMany, or one by one to return them
    // Since createMany does not return the created records in PostgreSQL/Prisma easily,
    // let's do a loop or just createMany and then query or just use create loop
    const results = [];
    for (const record of records) {
      const created = await tx.stockAdjustment.create({
        data: {
          partNo:      record.partNo,
          partName:    record.partName || null,
          qty:         parseFloat(record.qty) || 0,
          uom:         record.uom || null,
          price:       parseFloat(record.price) || 0,
          amount:      parseFloat(record.amount) || 0,
          barcode:     record.barcode || null,
          barcodeType: record.barcodeType || 'Single',
          type:        record.type,
          remarks:     record.remarks || null,
          createdAt:   record.createdAt ? new Date(record.createdAt) : new Date(),
          createdBy:   record.createdBy || 'Admin',
          updatedBy:   record.createdBy || 'Admin',
        }
      });
      results.push(created);
    }
    return results;
  }, TX_OPTS);
};
