import * as ProcessModel from '../models/processMasterModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middlewares/customErrors.js";


export const mapToFrontend = (r) => ({
  id: r.id,
  PM_Part_Name: r.partName,
  PM_Process_Name: r.processName,
  PM_Process_Name1: r.processName1 || '',
  PM_Process_Order: r.processOrder,
  TeamId: r.teamId || '',
  Machine_Code: r.machineCode || '',
  Machine_Name: r.machineName || '',
  PM_Days: r.days || '',
  PM_Hours: r.hours || '',
  Minutes: r.minutes || '',
  Setting_Time: r.settingTime || '',
  Cycle_Time: r.cycleTime || '',
  Handling_Time: r.handlingTime || '',
  Idle_Time: r.idleTime || '',
  CreatedBy: r.createdBy || 'Admin',
  CreatedDate: r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : ''
});

export const mapToDb = (body) => ({
  partName: body.PM_Part_Name,
  processName: body.PM_Process_Name,
  processName1: body.PM_Process_Name1 || null,
  processOrder: body.PM_Process_Order,
  teamId: body.TeamId || null,
  machineCode: body.Machine_Code || null,
  machineName: body.Machine_Name || null,
  days: String(body.PM_Days || ''),
  hours: String(body.PM_Hours || ''),
  minutes: String(body.Minutes || ''),
  settingTime: String(body.Setting_Time || ''),
  cycleTime: String(body.Cycle_Time || ''),
  handlingTime: String(body.Handling_Time || ''),
  idleTime: String(body.Idle_Time || ''),
});

export const getAll = async (req, res) => {
  try {
    const rawData = await ProcessModel.getAllProcesses(req.db);
    const data = rawData.map(mapToFrontend);
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const { PM_Part_Name, PM_Process_Name } = req.body;
    if (!PM_Part_Name || !PM_Part_Name.trim()) {
      throw new BadRequestError('PM_Part_Name is required');
    }
    if (!PM_Process_Name || !PM_Process_Name.trim()) {
      throw new BadRequestError('PM_Process_Name is required');
    }

    const dbData = mapToDb(req.body);
    dbData.createdBy = req.body.CreatedBy || 'Admin';
    dbData.updatedBy = req.body.CreatedBy || 'Admin';

    const record = await ProcessModel.createProcess(req.db, dbData);
    res.status(201).json({ success: true, data: mapToFrontend(record) });
  } catch (err) {
    
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { PM_Part_Name, PM_Process_Name } = req.body;
    if (!PM_Part_Name || !PM_Part_Name.trim()) {
      throw new BadRequestError('PM_Part_Name is required');
    }
    if (!PM_Process_Name || !PM_Process_Name.trim()) {
      throw new BadRequestError('PM_Process_Name is required');
    }

    const dbData = mapToDb(req.body);
    dbData.updatedBy = req.body.UpdatedBy || 'Admin';

    const record = await ProcessModel.updateProcess(req.db, id, dbData);
    res.json({ success: true, data: mapToFrontend(record) });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Process not found');
    }
    
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await ProcessModel.deleteProcess(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Process not found');
    }
    
    throw err;
  }
};

export const removeAll = async (req, res) => {
  try {
    await ProcessModel.deleteAllProcesses(req.db);
    res.json({ success: true, message: 'All processes deleted successfully' });
  } catch (err) {
    
    throw err;
  }
};
