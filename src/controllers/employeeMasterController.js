import * as EmployeeModel from '../models/employeeMasterModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middelwares/customErrors.js";


const toDate = (v) => (v && v.trim() ? new Date(v) : null);

const buildData = (body) => ({
  empName:        body.empName?.trim() || '',
  address:        body.address || null,
  contactNo:      body.contactNo || null,
  adharNo:        body.adharNo || null,
  joinDate:       toDate(body.joinDate),
  relevingDate:   toDate(body.relevingDate),
  department:     body.department || null,
  designation:    body.designation || null,
  contractPerson: body.contractPerson || null,
  companyName:    body.companyName || null,
  team:           body.team || null,
  emailId:        body.emailId || null,
  repPerson:      body.repPerson || null,
  status:         body.status || 'Active',
});

export const getAll = async (req, res) => {
  try {
    const data = await EmployeeModel.getAllEmployees(req.db);
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const getNextCode = async (req, res) => {
  try {
    const nextCode = await EmployeeModel.getNextEmpCode(req.db);
    res.json({ success: true, nextCode });
  } catch (err) {
    
    throw err;
  }
};

export const getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const record = await EmployeeModel.getEmployeeById(req.db, id);
    if (!record) throw new NotFoundError('Employee not found');
    res.json({ success: true, data: record });
  } catch (err) {
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    if (!req.body.empName?.trim())
      throw new BadRequestError('empName is required');

    const empCode = req.body.empCode?.trim()
      ? req.body.empCode.trim()
      : await EmployeeModel.getNextEmpCode(req.db);

    const data = buildData(req.body);
    data.empCode = empCode;
    data.createdBy = req.body.createdBy || 'Admin';
    data.updatedBy = req.body.createdBy || 'Admin';

    const record = await EmployeeModel.createEmployee(req.db, data);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002')
      throw new ConflictError('Employee code already exists');
    
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!req.body.empName?.trim())
      throw new BadRequestError('empName is required');

    const data = buildData(req.body);
    data.updatedBy = req.body.updatedBy || 'Admin';

    const record = await EmployeeModel.updateEmployee(req.db, id, data);
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025')
      throw new NotFoundError('Employee not found');
    
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await EmployeeModel.deleteEmployee(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025')
      throw new NotFoundError('Employee not found');
    
    throw err;
  }
};
