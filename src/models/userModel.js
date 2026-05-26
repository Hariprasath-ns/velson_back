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
