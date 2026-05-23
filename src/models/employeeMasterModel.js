export const getAllEmployees = (db) =>
  db.employeeMaster.findMany({ orderBy: { createdAt: 'asc' } });

export const getEmployeeById = (db, id) =>
  db.employeeMaster.findUnique({ where: { id } });

export const getNextEmpCode = async (db) => {
  const rows = await db.$queryRaw`
    SELECT "empCode" FROM employee_master
    WHERE "empCode" ~ '^EMP[0-9]+$'
    ORDER BY CAST(SUBSTRING("empCode" FROM 4) AS INTEGER) DESC
    LIMIT 1
  `;
  if (rows.length > 0) {
    const num = parseInt(rows[0].empCode.replace('EMP', ''), 10);
    return 'EMP' + String(num + 1).padStart(3, '0');
  }
  return 'EMP001';
};

export const createEmployee = (db, data) =>
  db.employeeMaster.create({ data });

export const updateEmployee = (db, id, data) =>
  db.employeeMaster.update({ where: { id }, data });

export const deleteEmployee = (db, id) =>
  db.employeeMaster.delete({ where: { id } });
