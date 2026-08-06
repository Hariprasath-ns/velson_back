import { eventBus } from "../services/eventBus.js";
import { SOCKET_EVENTS } from "../utils/socketEvents.js";

const TX_OPTS = { maxWait: 10000, timeout: 20000 };

export const getAllStockAdjustments = (db) =>
  db.stockAdjustment.findMany({
    orderBy: { createdAt: 'desc' },
  });

export const createStockAdjustments = (db, dataArray, userContext = null) => {
  return db.$transaction(async (tx) => {
    // If it's a single object, wrap it in array
    const records = Array.isArray(dataArray) ? dataArray : [dataArray];
    
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

      // Register post-commit event publishing
      results.push(created);
    }
    
    // Once committed, we trigger Event Bus publishing
    tx.onCommit?.(async () => {
      // Handled outside transaction
    }) || process.nextTick(() => {
      results.forEach(res => {
        eventBus.publish(SOCKET_EVENTS.STOCK_ADJUSTED, {
          partNo: res.partNo,
          qty: res.qty,
          uom: res.uom,
          type: res.type,
          priority: res.type === "INWARD" ? "Success" : "Warning",
          referenceType: "StockAdjustment",
          referenceId: res.id,
          referenceNumber: res.barcode || String(res.id),
          userId: userContext?.userId || null,
          username: userContext?.email || null,
          actorContext: userContext
        });

        if (res.type === "INWARD" && res.barcode) {
          eventBus.publish(SOCKET_EVENTS.BARCODE_CREATED, {
            referenceId: res.id,
            referenceNumber: res.barcode,
            referenceType: "barcode",
            barcode: res.barcode,
            partNo: res.partNo,
            userId: userContext?.userId || null,
            actorContext: userContext
          });
        }
      });
    });

    return results;
  }, TX_OPTS);
};
