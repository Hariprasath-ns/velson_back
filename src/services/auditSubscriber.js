import { eventBus } from "./eventBus.js";
import { SOCKET_EVENTS } from "../utils/socketEvents.js";
import { neonPrisma, dockerPrisma } from "../config/db.js";

const getDB = (tx) => {
  if (tx) return tx;
  return process.env.DB_ENV === "neon" ? neonPrisma : dockerPrisma;
};

export const handleAuditEvent = async (eventName, payload) => {
  const db = getDB(payload.tx);
  const actor = payload.actorContext || {};

  try {
    // Generate audit entry
    await db.auditLog.create({
      data: {
        userId: payload.userId || actor.userId || null,
        username: payload.username || actor.userName || null,
        action: eventName.split(".")[1]?.toUpperCase() || "ACTION",
        tableName: eventName.split(".")[0] || "SYSTEM",
        recordId: payload.referenceId ? String(payload.referenceId) : "0",
        oldData: payload.oldData || null,
        newData: payload.newData || null,
        ipAddress: payload.ipAddress || actor.ipAddress || null,
        userAgent: payload.userAgent || actor.userAgent || null,
        actorContext: payload.actorContext || null
      }
    });
  } catch (err) {
    console.error(`[AuditSubscriber] Error logging audit event for "${eventName}":`, err);
  }
};

export const initAuditSubscriber = () => {
  Object.values(SOCKET_EVENTS).forEach(eventName => {
    // Subscribe to all business events
    if (eventName !== SOCKET_EVENTS.NOTIFICATION_CREATED && eventName !== SOCKET_EVENTS.NOTIFICATION_READ) {
      eventBus.subscribe(eventName, (payload) => handleAuditEvent(eventName, payload));
    }
  });
  console.log("[AuditSubscriber] Audit Logger successfully subscribed to all ERP events.");
};
