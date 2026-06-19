export const createUser = (db, data) => {
  const { name, email, password, role } = data;
  return db.user.create({
    data: {
      name,
      email,
      credentials: {
        create: {
          username: email,
          password,
          role: role || "user",
        },
      },
    },
    include: { credentials: true },
  });
};

export const getAllUsers = (db) =>
  db.user.findMany({
    include: { credentials: true },
    orderBy: { createdAt: "desc" },
  });

export const getUserById = (db, id) =>
  db.user.findUnique({
    where: { id },
    include: { credentials: true },
  });

export const updateUser = (db, id, data) => {
  const { name, email, password, role, isActive } = data;
  const credUpdate = {};
  if (email) credUpdate.username = email;
  if (role) credUpdate.role = role;
  if (password) credUpdate.password = password;
  if (isActive !== undefined) credUpdate.isActive = isActive;

  return db.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      credentials: { update: credUpdate },
    },
    include: { credentials: true },
  });
};

export const deleteUser = (db, id) =>
  db.user.delete({ where: { id } });

export const getUserPermissions = (db, userId) =>
  db.userPermission.findMany({
    where: { userId },
  });

export const updateUserPermissions = async (db, userId, permissions) => {
  return db.$transaction(async (tx) => {
    // Delete existing custom permissions for this user
    await tx.userPermission.deleteMany({
      where: { userId },
    });
    
    // Add new ones
    if (permissions && permissions.length > 0) {
      const data = permissions.map((p) => ({
        userId,
        module: p.module,
        canDisplay: !!p.canDisplay,
        canSave: !!p.canSave,
        canEdit: !!p.canEdit,
        canDelete: !!p.canDelete,
        canPrint: !!p.canPrint,
      }));
      await tx.userPermission.createMany({
        data,
      });
    }

    return tx.userPermission.findMany({
      where: { userId },
    });
  });
};

export const getRolePermissions = (db, role) =>
  db.rolePermission.findMany({
    where: { role },
  });

export const updateRolePermissions = async (db, role, permissions) => {
  return db.$transaction(async (tx) => {
    // Delete existing custom permissions for this role
    await tx.rolePermission.deleteMany({
      where: { role },
    });
    
    // Add new ones
    if (permissions && permissions.length > 0) {
      const data = permissions.map((p) => ({
        role,
        module: p.module,
        canDisplay: !!p.canDisplay,
        canSave: !!p.canSave,
        canEdit: !!p.canEdit,
        canDelete: !!p.canDelete,
        canPrint: !!p.canPrint,
      }));
      await tx.rolePermission.createMany({
        data,
      });
    }

    return tx.rolePermission.findMany({
      where: { role },
    });
  });
};
