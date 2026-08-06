export const getAllCustomers = async (db, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    db.customerMaster.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' }
    }),
    db.customerMaster.count()
  ]);
  return { data, total, page, limit };
};

export const getCustomerById = (db, id) =>
  db.customerMaster.findUnique({ where: { id } });

export const getNextCCode = async (db) => {
  const rows = await db.$queryRaw`
    SELECT "cCode" FROM customer_master
    WHERE "cCode" ~ '^CUS[0-9]+$'
    ORDER BY CAST(SUBSTRING("cCode" FROM 4) AS INTEGER) DESC
    LIMIT 1
  `;
  if (rows.length > 0) {
    const num = parseInt(rows[0].cCode.replace('CUS', ''), 10);
    return 'CUS' + String(num + 1);
  }
  return 'CUS100';
};

export const createCustomer = (db, data) =>
  db.customerMaster.create({ data });

export const updateCustomer = (db, id, data) =>
  db.customerMaster.update({ where: { id }, data });

export const deleteCustomer = (db, id) =>
  db.customerMaster.delete({ where: { id } });
