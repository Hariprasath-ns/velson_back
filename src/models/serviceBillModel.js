import { eventBus } from '../services/eventBus.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';

export const getNextServiceBillRefNo = async (db) => {
  const rows = await db.$queryRaw`
    SELECT "refNo" FROM service_bill
  `;
  const usedNums = new Set();
  for (const r of rows) {
    if (r.refNo) {
      const num = parseInt(r.refNo, 10);
      if (!isNaN(num)) {
        usedNums.add(num);
      }
    }
  }
  let nextNum = 1;
  while (usedNums.has(nextNum)) {
    nextNum++;
  }
  return { refNo: String(nextNum) };
};

export const getAllServiceBills = (db) =>
  db.serviceBill.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: { orderBy: { slNo: 'asc' } } }
  });

export const getServiceBillById = (db, id) =>
  db.serviceBill.findUnique({
    where: { id },
    include: { items: { orderBy: { slNo: 'asc' } } }
  });

const TX_OPTS = { maxWait: 10000, timeout: 20000 };

export const createServiceBill = (db, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    // Rule 2 & 3: Check if there is already an active service bill for this serviceJobNo
    if (headerData.serviceJobNo) {
      const existingActiveBill = await tx.serviceBill.findFirst({
        where: {
          serviceJobNo: headerData.serviceJobNo,
          status: { not: "Cancelled" }
        }
      });
      if (existingActiveBill) {
        throw new Error(`A Service Bill has already been created for Service Job No ${headerData.serviceJobNo}.`);
      }
    }

    const master = await tx.serviceBill.create({ data: headerData });
    if (detailRows && detailRows.length > 0) {
      const dbDetailRows = detailRows.map((row) => ({
        ...row,
        serviceBillId: master.id
      }));
      await tx.serviceBillItem.createMany({
        data: dbDetailRows
      });
    }

    // Rule 1: Automatically set corresponding ServiceBooking's tempStatus to 'Close'
    if (headerData.serviceJobNo) {
      await tx.serviceBooking.updateMany({
        where: { serviceJobNo: headerData.serviceJobNo },
        data: { tempStatus: "Close" }
      });
    }

    return tx.serviceBill.findUnique({
      where: { id: master.id },
      include: { items: { orderBy: { slNo: 'asc' } } }
    });
  }, TX_OPTS);

export const updateServiceBill = (db, id, headerData, detailRows) =>
  db.$transaction(async (tx) => {
    await tx.serviceBillItem.deleteMany({
      where: { serviceBillId: id }
    });

    const master = await tx.serviceBill.update({
      where: { id },
      data: headerData
    });

    if (detailRows && detailRows.length > 0) {
      const dbDetailRows = detailRows.map((row) => ({
        ...row,
        serviceBillId: master.id
      }));
      await tx.serviceBillItem.createMany({
        data: dbDetailRows
      });
    }

    return tx.serviceBill.findUnique({
      where: { id: master.id },
      include: { items: { orderBy: { slNo: 'asc' } } }
    });
  }, TX_OPTS);

export const deleteServiceBill = (db, id) =>
  db.$transaction(async (tx) => {
    const bill = await tx.serviceBill.findUnique({ where: { id } });
    if (bill && bill.serviceJobNo) {
      await tx.serviceBooking.updateMany({
        where: { serviceJobNo: bill.serviceJobNo },
        data: { tempStatus: "Open" }
      });
    }
    return tx.serviceBill.delete({
      where: { id }
    });
  }, TX_OPTS);

export const requestBillCancellation = async (db, id, actorContext) => {
  const bill = await db.serviceBill.findUnique({ where: { id } });
  if (!bill) throw new Error("Service Bill not found");

  const updatedBill = await db.serviceBill.update({
    where: { id },
    data: { status: "PendingCancel" }
  });

  // Trigger Notification
  eventBus.publish(SOCKET_EVENTS.SERVICE_BILL_CANCEL_REQUESTED, {
    refNo: bill.refNo,
    userName: actorContext?.userName || "User",
    priority: "Warning",
    referenceType: "ServiceBill",
    referenceId: bill.id,
    referenceNumber: bill.refNo,
    actorContext
  });

  return updatedBill;
};

export const approveBillCancellation = async (db, id, actorContext) => {
  const bill = await db.serviceBill.findUnique({ where: { id } });
  if (!bill) throw new Error("Service Bill not found");

  const updatedBill = await db.serviceBill.update({
    where: { id },
    data: { status: "Cancelled" }
  });

  // Revert tempStatus to 'Open' when cancellation is approved by admin
  if (bill.serviceJobNo) {
    await db.serviceBooking.updateMany({
      where: { serviceJobNo: bill.serviceJobNo },
      data: { tempStatus: "Open" }
    });
  }

  return updatedBill;
};
