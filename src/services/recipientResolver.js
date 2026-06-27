export const resolveRecipients = async (db, configId, eventName, actorUserId = null) => {
  // 1. Get all roles authorized to receive notifications for this event configuration
  const rights = await db.notificationRight.findMany({
    where: { configId }
  });

  const authorizedRoles = rights.flatMap(r => {
    const role = r.role || "";
    return [
      role,
      role.toLowerCase(),
      role.toUpperCase(),
      role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
    ];
  });
  if (authorizedRoles.length === 0) return [];

  // 2. Fetch all users who have these roles
  const targetUsers = await db.user.findMany({
    where: {
      credentials: {
        role: { in: authorizedRoles },
        isActive: true
      }
    },
    select: {
      id: true,
      credentials: {
        select: { role: true }
      }
    }
  });

  if (targetUsers.length === 0) return [];

  // 3. Retrieve specific channel preferences for these users
  const userIds = targetUsers.map(u => u.id);
  const preferences = await db.userNotificationPreference.findMany({
    where: {
      configId,
      userId: { in: userIds }
    }
  });

  const preferenceMap = new Map(); // userId -> preference record
  preferences.forEach(p => preferenceMap.set(p.userId, p));

  const resolved = [];

  for (const user of targetUsers) {
    // Exclude the performing user (actor) by default
    if (actorUserId && user.id === actorUserId) {
      continue;
    }

    const pref = preferenceMap.get(user.id);
    
    // Default preferences if none exist in the database
    const popupEnabled = pref ? pref.popupEnabled : true;
    const bellEnabled = pref ? pref.bellEnabled : true;
    const emailEnabled = pref ? pref.emailEnabled : false;
    const whatsappEnabled = pref ? pref.whatsappEnabled : false;
    const smsEnabled = pref ? pref.smsEnabled : false;
    const muted = pref ? pref.muted : false;

    if (!muted && (bellEnabled || popupEnabled)) {
      resolved.push({
        userId: user.id,
        role: user.credentials?.role,
        channels: {
          popup: popupEnabled,
          bell: bellEnabled,
          email: emailEnabled,
          whatsapp: whatsappEnabled,
          sms: smsEnabled
        }
      });
    }
  }

  return resolved;
};
