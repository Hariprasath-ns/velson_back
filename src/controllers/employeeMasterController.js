import * as EmployeeModel from '../models/employeeMasterModel.js';

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
    console.error('[employeeMaster] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getNextCode = async (req, res) => {
  try {
    const nextCode = await EmployeeModel.getNextEmpCode(req.db);
    res.json({ success: true, nextCode });
  } catch (err) {
    console.error('[employeeMaster] getNextCode error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const record = await EmployeeModel.getEmployeeById(req.db, id);
    if (!record) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    if (!req.body.empName?.trim())
      return res.status(400).json({ success: false, message: 'empName is required' });

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
      return res.status(409).json({ success: false, message: 'Employee code already exists' });
    console.error('[employeeMaster] create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!req.body.empName?.trim())
      return res.status(400).json({ success: false, message: 'empName is required' });

    const data = buildData(req.body);
    data.updatedBy = req.body.updatedBy || 'Admin';

    const record = await EmployeeModel.updateEmployee(req.db, id, data);
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025')
      return res.status(404).json({ success: false, message: 'Employee not found' });
    console.error('[employeeMaster] update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await EmployeeModel.deleteEmployee(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025')
      return res.status(404).json({ success: false, message: 'Employee not found' });
    console.error('[employeeMaster] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
