export const getAll = async (db) => {
  return db.serviceBooking.findMany({ orderBy: { createdAt: 'desc' } });
};

export const create = async (db, data) => {
  return db.serviceBooking.create({ data });
};

export const update = async (db, id, data) => {
  return db.serviceBooking.update({ where: { id }, data });
};

export const remove = async (db, id) => {
  return db.$transaction(async (tx) => {
    const booking = await tx.serviceBooking.findUnique({ where: { id } });
    if (!booking) {
      throw new Error("Record not found");
    }
    
    const { serviceJobNo } = booking;
    
    // Cascade delete across all tables that use serviceJobNo
    await tx.serviceDetail.deleteMany({ where: { serviceJobNo } });
    await tx.bomCreation.deleteMany({ where: { serviceJobNo } });
    await tx.serviceSpare.deleteMany({ where: { serviceJobNo } });
    await tx.serviceBill.deleteMany({ where: { serviceJobNo } });
    
    // Finally, delete the booking itself
    return tx.serviceBooking.delete({ where: { id } });
  });
};
