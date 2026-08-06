const CUSTOMER_SELECT = { select: { cCode: true, customerName: true } };

export const getAllVehicles = (db) =>
  db.vehicleMaster.findMany({
    orderBy: { createdAt: 'asc' },
    include: { customer: CUSTOMER_SELECT },
  });

export const getVehicleById = (db, id) =>
  db.vehicleMaster.findUnique({
    where: { id },
    include: { customer: CUSTOMER_SELECT },
  });

export const createVehicle = (db, data) =>
  db.vehicleMaster.create({
    data,
    include: { customer: CUSTOMER_SELECT },
  });

export const updateVehicle = (db, id, data) =>
  db.vehicleMaster.update({
    where: { id },
    data,
    include: { customer: CUSTOMER_SELECT },
  });

export const deleteVehicle = (db, id) =>
  db.vehicleMaster.delete({ where: { id } });
