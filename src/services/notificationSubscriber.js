import { eventBus } from "./eventBus.js";
import { SOCKET_EVENTS } from "../utils/socketEvents.js";
import { resolveRecipients } from "./recipientResolver.js";
import { compileTemplate } from "./templateService.js";
import { sendToUserRoom } from "./socketService.js";
import { neonPrisma, dockerPrisma } from "../config/db.js";

// Helper to determine the active Prisma database client
const getDB = (tx) => {
  if (tx) return tx;
  return process.env.DB_ENV === "neon" ? neonPrisma : dockerPrisma;
};

export const checkAndTriggerStockLow = async (db, partNo, actorContext) => {
  try {
    const item = await db.itemMaster.findFirst({
      where: { partNo: { equals: partNo, mode: 'insensitive' } }
    });
    if (!item || (item.minStock === null && item.reorderLevel === null)) return;

    // Calculate current total stock
    const grnSum = await db.gRNDetail.aggregate({
      where: { itemCode: { equals: partNo, mode: 'insensitive' } },
      _sum: { stockQty: true }
    });
    const adjSum = await db.stockAdjustment.aggregate({
      where: { partNo: { equals: partNo, mode: 'insensitive' }, type: 'INWARD' },
      _sum: { qty: true }
    });
    const totalStock = (grnSum._sum.stockQty || 0) + (adjSum._sum.qty || 0);

    const minStock = item.minStock !== null ? item.minStock : (item.reorderLevel || 0);

    if (totalStock < minStock) {
      // Publish STOCK_LOW event
      eventBus.publish(SOCKET_EVENTS.STOCK_LOW, {
        partNo,
        stockQty: totalStock,
        minStock,
        priority: "Warning",
        referenceType: "item-master",
        referenceId: item.id,
        referenceNumber: partNo,
        actorContext
      });
    }
  } catch (err) {
    console.error(`[NotificationEngine] Error checking stock low for part "${partNo}":`, err);
  }
};

/**
 * Main handler for business events dispatched from the Event Bus.
 */
export const handleBusinessEvent = async (eventName, payload) => {
  // Extract database transaction if passed in payload, otherwise fallback to default connection
  const db = getDB(payload.tx);

  // Special check for stock events to trigger stock.low warning
  if (eventName === SOCKET_EVENTS.STOCK_UPDATED || eventName === SOCKET_EVENTS.STOCK_ADJUSTED) {
    const partNo = payload.partNo;
    if (partNo) {
      process.nextTick(() => {
        checkAndTriggerStockLow(db, partNo, payload.actorContext || null);
      });
    }
  }

  try {
    // 0. Check Centralized Global Notification Switch
    const globalSetting = await db.systemSetting.findUnique({
      where: { key: "global_notifications_enabled" }
    });
    const globalEnabled = globalSetting ? (globalSetting.value === "true") : true;

    if (!globalEnabled) {
      console.log(`[NotificationEngine] Centralized Global Notification Switch is disabled. Skipping event processing.`);
      return;
    }

    // 1. Fetch event configuration
    const config = await db.notificationConfig.findUnique({
      where: { event: eventName }
    });
    if (!config) {
      console.warn(`[NotificationEngine] No notification configuration found for event "${eventName}". Skipping.`);
      return;
    }

    // 2. Resolve target recipients based on role rights and personal preferences
    const actorUserId = payload.userId || payload.actorContext?.userId || null;
    const recipients = await resolveRecipients(db, config.id, eventName, actorUserId);
    if (recipients.length === 0) return;

    // 3. Compile title and message templates (merge actorContext for placeholder replacement)
    const templateContext = {
      ...payload,
      ...(payload.actorContext || {})
    };
    const title = compileTemplate(config.titleTemplate, templateContext);
    const message = compileTemplate(config.messageTemplate, templateContext);

    // Generate a fallback summary of changes if not provided
    const summaryOfChanges = payload.summaryOfChanges || 
      (payload.referenceNumber ? `${config.module} ${config.action} (${payload.referenceNumber})` : `${config.module} ${config.action}`);

    // 4. Save notification records to the database for all matching recipients
    const notificationsToCreate = recipients.map(rec => ({
      userId: rec.userId,
      configId: config.id,
      title,
      message,
      priority: payload.priority || "Info",
      referenceType: payload.referenceType || null,
      referenceId: payload.referenceId ? String(payload.referenceId) : null,
      referenceNumber: payload.referenceNumber || null,
      metadata: {
        actorContext: payload.actorContext || null,
        summaryOfChanges
      }
    }));

    // Perform database insertions and retrieve created records directly
    const savedNotifications = await db.notification.createManyAndReturn({
      data: notificationsToCreate
    });

    // 5. Emit real-time WebSocket events to online recipients
    const emitNotifications = () => {
      savedNotifications.forEach(notif => {
        const payloadData = {
          id: notif.id,
          type: eventName,
          module: config.module,
          priority: notif.priority,
          title: notif.title,
          message: notif.message,
          referenceType: notif.referenceType,
          referenceId: notif.referenceId,
          referenceNumber: notif.referenceNumber,
          createdAt: notif.createdAt,
          isRead: notif.isRead,
          metadata: notif.metadata
        };
        sendToUserRoom(notif.userId, SOCKET_EVENTS.NOTIFICATION_CREATED, payloadData);
      });
    };

    if (payload.tx) {
      if (Array.isArray(payload.postCommitCallbacks)) {
        payload.postCommitCallbacks.push(emitNotifications);
      } else {
        process.nextTick(emitNotifications);
      }
    } else {
      emitNotifications();
    }

  } catch (err) {
    console.error(`[NotificationEngine] Error processing event "${eventName}":`, err);
  }
};

/**
 * Initialize the Notification Engine by subscribing it to all standard ERP events.
 */
export const initNotificationSubscriber = () => {
  Object.values(SOCKET_EVENTS).forEach(eventName => {
    // Skip notification action events themselves to prevent circular triggers
    if (eventName !== SOCKET_EVENTS.NOTIFICATION_CREATED && eventName !== SOCKET_EVENTS.NOTIFICATION_READ) {
      eventBus.subscribe(eventName, (payload) => handleBusinessEvent(eventName, payload));
    }
  });
  console.log("[NotificationEngine] Centralized Notification Engine successfully subscribed to all ERP events.");
};
