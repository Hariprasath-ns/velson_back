export const getAllMachines = (db) =>
  db.machineMaster.findMany({ orderBy: { createdAt: 'desc' } });

export const getMachineById = (db, id) =>
  db.machineMaster.findUnique({ where: { id } });

export const getNextMachineCode = async (db) => {
  const rows = await db.$queryRaw`
    SELECT "machineCode" FROM machine_master
    WHERE "machineCode" ~ '^MCH[0-9]+$'
    ORDER BY CAST(SUBSTRING("machineCode" FROM 4) AS INTEGER) DESC
    LIMIT 1
  `;
  if (rows.length > 0) {
    const num = parseInt(rows[0].machineCode.replace('MCH', ''), 10);
    return 'MCH' + String(num + 1).padStart(3, '0');
  }
  return 'MCH001';
};

export const createMachine = (db, data) =>
  db.machineMaster.create({ data });

export const updateMachine = (db, id, data) =>
  db.machineMaster.update({ where: { id }, data });

export const deleteMachine = (db, id) =>
  db.machineMaster.delete({ where: { id } });
