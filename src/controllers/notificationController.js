import { BadRequestError, NotFoundError } from "../middlewares/customErrors.js";
import { sendToUserRoom } from "../services/socketService.js";
import { SOCKET_EVENTS } from "../utils/socketEvents.js";

/**
 * Get paginated list of notifications for the authenticated user.
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { status, priority, search } = req.query;

    const where = {
      userId,
      isArchived: false
    };

    if (status === "read") {
      where.isRead = true;
    } else if (status === "unread") {
      where.isRead = false;
    }

    if (priority && priority !== "all") {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } }
      ];
    }

    const [notifications, total] = await Promise.all([
      req.db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          config: {
            select: { module: true, event: true }
          }
        }
      }),
      req.db.notification.count({ where })
    ]);

    res.json({
      success: true,
      data: notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark a single notification as read.
 */
export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      throw new BadRequestError("Invalid notification ID");
    }

    const notification = await req.db.notification.findFirst({
      where: { id, userId }
    });

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    const updated = await req.db.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    sendToUserRoom(userId, SOCKET_EVENTS.NOTIFICATION_READ, { id, isAll: false });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark all active unread notifications of the user as read.
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await req.db.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    sendToUserRoom(userId, SOCKET_EVENTS.NOTIFICATION_READ, { isAll: true });

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};

/**
 * Soft-delete (archive) a notification for the authenticated user.
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new BadRequestError("Invalid notification ID");
    }

    const notification = await req.db.notification.findFirst({
      where: { id, userId }
    });

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    const updated = await req.db.notification.update({
      where: { id },
      data: {
        isArchived: true
      }
    });

    sendToUserRoom(userId, SOCKET_EVENTS.NOTIFICATION_READ, { id, isDeleted: true });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * Get notification channels preferences for the logged-in user.
 */
export const getPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch all notification events configuration
    const configs = await req.db.notificationConfig.findMany({
      orderBy: { module: "asc" }
    });

    // Fetch user overrides
    const prefs = await req.db.userNotificationPreference.findMany({
      where: { userId }
    });

    const prefMap = new Map();
    prefs.forEach(p => prefMap.set(p.configId, p));

    const data = configs.map(c => {
      const p = prefMap.get(c.id);
      return {
        configId: c.id,
        event: c.event,
        module: c.module,
        description: c.description,
        popupEnabled: p ? p.popupEnabled : true,
        bellEnabled: p ? p.bellEnabled : true,
        emailEnabled: p ? p.emailEnabled : false,
        whatsappEnabled: p ? p.whatsappEnabled : false,
        smsEnabled: p ? p.smsEnabled : false,
        muted: p ? p.muted : false
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * Update notification channel preferences for the user.
 */
export const updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body; // Array of preferences { configId, popupEnabled, etc }

    if (!Array.isArray(preferences)) {
      throw new BadRequestError("preferences must be an array");
    }

    await req.db.$transaction(async (tx) => {
      // 1. Delete existing preferences for this user
      await tx.userNotificationPreference.deleteMany({
        where: { userId }
      });

      // 2. Insert new preferences in bulk
      if (preferences.length > 0) {
        await tx.userNotificationPreference.createMany({
          data: preferences.map(p => ({
            userId,
            configId: p.configId,
            popupEnabled: p.popupEnabled ?? true,
            bellEnabled: p.bellEnabled ?? true,
            emailEnabled: p.emailEnabled ?? false,
            whatsappEnabled: p.whatsappEnabled ?? false,
            smsEnabled: p.smsEnabled ?? false,
            muted: p.muted ?? false
          }))
        });
      }
    });

    res.json({ success: true, message: "Preferences updated successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Get notification rights matrix for Admin.
 */
export const getRightsMatrix = async (req, res, next) => {
  try {
    const configs = await req.db.notificationConfig.findMany({
      include: {
        rights: true
      },
      orderBy: { module: "asc" }
    });

    // Reuse role list conventions from backend
    const roles = [
      "ACCOUNTS",
      "ADMIN",
      "DEPT HEAD",
      "ERP",
      "MAINTENANCE",
      "MANAGER",
      "OPERATOR",
      "PRODUCTION",
      "PRODUCTION - SERVICE HEAD",
      "PURCHASE",
      "QUALITY",
      "Quotation Department",
      "SPARES",
      "STORE",
      "STORE HEAD",
      "STORE MATERIAL ISSUE",
      "SUPERVISOR",
      "TECHNICAL",
      "TECHNICAL HEAD"
    ];

    res.json({ success: true, data: { configs, roles } });
  } catch (err) {
    next(err);
  }
};

/**
 * Update rights matrix configurations (Admin only).
 */
export const updateRightsMatrix = async (req, res, next) => {
  try {
    const { rights } = req.body; // Array of { configId, role, enabled }

    if (!Array.isArray(rights)) {
      throw new BadRequestError("rights must be an array");
    }

    await req.db.$transaction(async (tx) => {
      for (const r of rights) {
        if (r.enabled) {
          await tx.notificationRight.upsert({
            where: {
              configId_role: {
                configId: r.configId,
                role: r.role.toUpperCase()
              }
            },
            update: {},
            create: {
              configId: r.configId,
              role: r.role.toUpperCase()
            }
          });
        } else {
          try {
            await tx.notificationRight.delete({
              where: {
                configId_role: {
                  configId: r.configId,
                  role: r.role.toUpperCase()
                }
              }
            });
          } catch (e) {
            // Safe to ignore if record does not exist
          }
        }
      }
    });

    res.json({ success: true, message: "Notification rights updated successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Get global settings (admin only).
 */
export const getSettings = async (req, res, next) => {
  try {
    const globalSetting = await req.db.systemSetting.findUnique({
      where: { key: "global_notifications_enabled" }
    });
    
    const enabled = globalSetting ? (globalSetting.value === "true") : true;

    res.json({
      success: true,
      data: {
        globalNotificationsEnabled: enabled
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update global settings (admin only).
 */
export const updateSettings = async (req, res, next) => {
  try {
    const { globalNotificationsEnabled } = req.body;

    if (globalNotificationsEnabled === undefined) {
      throw new BadRequestError("globalNotificationsEnabled is required");
    }

    const valueStr = String(globalNotificationsEnabled);

    await req.db.systemSetting.upsert({
      where: { key: "global_notifications_enabled" },
      update: { value: valueStr },
      create: { key: "global_notifications_enabled", value: valueStr }
    });

    res.json({
      success: true,
      message: `Global notifications successfully set to ${globalNotificationsEnabled}`
    });
  } catch (err) {
    next(err);
  }
};

