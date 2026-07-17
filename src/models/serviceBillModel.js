import { eventBus } from '../services/eventBus.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';

export const getNextServiceBillRefNo = async (db) => {
  const rows = await db.$queryRaw`
    SELECT MAX(CAST("refNo" AS INTEGER)) as "maxRefNo" FROM service_bill
    WHERE "refNo" ~ '^[0-9]+$'
  `;
  const nextNum = (rows.length > 0 && rows[0].maxRefNo != null) ? parseInt(rows[0].maxRefNo, 10) + 1 : 1;
  return { refNo: String(nextNum) };
};

export const getAllServiceBills = async (db, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    db.serviceBill.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { items: { orderBy: { slNo: 'asc' } } }
    }),
    db.serviceBill.count()
  ]);
  return { data, total, page, limit };
};

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

    // Rule 1: Automatically set corresponding ServiceBooking's tempStatus and status to 'Close'
    if (headerData.serviceJobNo) {
      await tx.serviceBooking.updateMany({
        where: { serviceJobNo: headerData.serviceJobNo },
        data: { 
          tempStatus: "Close",
          status: "Close"
        }
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
        data: { 
          tempStatus: "Open",
          status: "Pending"
        }
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

  // Revert tempStatus to 'Open' and status to 'Pending' when cancellation is approved by admin
  if (bill.serviceJobNo) {
    await db.serviceBooking.updateMany({
      where: { serviceJobNo: bill.serviceJobNo },
      data: { 
        tempStatus: "Open",
        status: "Pending"
      }
    });
  }

  return updatedBill;
};
