import { eventBus } from "./eventBus.js";
import { SOCKET_EVENTS } from "../utils/socketEvents.js";
import { broadcastEvent } from "./socketService.js";

export const handleDashboardEvent = (eventName) => {
  // Emit lightweight dashboard refresh events to keep frontend counters/charts in sync
  try {
    const triggerEvents = [
      SOCKET_EVENTS.STOCK_UPDATED,
      SOCKET_EVENTS.STOCK_ADJUSTED,
      SOCKET_EVENTS.GRN_COMPLETED,
      SOCKET_EVENTS.PURCHASE_ORDER_APPROVED,
      SOCKET_EVENTS.JOBCARD_COMPLETED,
      SOCKET_EVENTS.SERVICE_COMPLETED
    ];

    if (triggerEvents.includes(eventName)) {
      broadcastEvent(SOCKET_EVENTS.DASHBOARD_REFRESH, {
        reason: eventName,
        timestamp: new Date()
      });
    }
  } catch (err) {
    console.error(`[DashboardSubscriber] Error handling dashboard refresh for "${eventName}":`, err);
  }
};

export const initDashboardSubscriber = () => {
  Object.values(SOCKET_EVENTS).forEach(eventName => {
    eventBus.subscribe(eventName, () => handleDashboardEvent(eventName));
  });
  console.log("[DashboardSubscriber] Dashboard Subscriber successfully registered.");
};
