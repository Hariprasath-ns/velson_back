import * as MRModel from '../models/materialRequestModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middelwares/customErrors.js";


const toFloat = (v) => (v !== '' && v != null ? parseFloat(v) || 0 : 0);

const buildDetailRows = (items = []) =>
  items.map((item) => ({
    modelName:     item.modelName     || null,
    itemCode:      item.itemCode      || null,
    itemName:      item.itemName      || null,
    requestedQty:  toFloat(item.requestedQty),
    materialGrade: item.materialGrade || null,
    unit:          item.unit          || null,
    remarks:       item.remarks       || null,
  }));

export const getNextNo = async (req, res) => {
  try {
    const result = await MRModel.getNextMrNo(req.db);
    res.json({ success: true, ...result });
  } catch (err) {
    throw err;
  }
};

export const getAll = async (req, res) => {
  try {
    const data = await MRModel.getAllMaterialRequests(req.db);
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

export const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await MRModel.getMaterialRequestById(req.db, id);
    if (!data) throw new NotFoundError('Material request not found');
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

export const getByNo = async (req, res) => {
  try {
    const data = await MRModel.getMaterialRequestByNo(req.db, req.params.mrNo);
    if (!data) throw new NotFoundError('Material request not found');
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const {
      tempRequestNo, departmentTo, requestingUser, team, requestingFor,
      requestDate, requiredDate, requiredDays, storeName, bomPartName,
      vehicleName, remarks, status, createdBy, items,
    } = req.body;

    const { mrNo, financialYear } = await MRModel.getNextMrNo(req.db);

    const headerData = {
      mrNo,
      financialYear,
      tempRequestNo:  tempRequestNo  || null,
      departmentTo:   departmentTo   || null,
      requestingUser: requestingUser || null,
      team:           team           || null,
      requestingFor:  requestingFor  || null,
      requestDate:    requestDate ? new Date(requestDate) : new Date(),
      requiredDate:   requiredDate ? new Date(requiredDate) : null,
      requiredDays:   requiredDays   || null,
      storeName:      storeName      || null,
      bomPartName:    bomPartName    || null,
      vehicleName:    vehicleName    || null,
      remarks:        remarks        || null,
      status:         status         || 'Pending',
      createdBy:      createdBy      || 'Admin',
      updatedBy:      createdBy      || 'Admin',
    };

    const record = await MRModel.createMaterialRequest(req.db, headerData, buildDetailRows(items));
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ConflictError('Material request number already exists');
    }
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      departmentTo, requestingUser, team, requestingFor,
      requestDate, requiredDate, requiredDays, storeName, bomPartName,
      vehicleName, remarks, status, updatedBy, items,
    } = req.body;

    const headerData = {
      departmentTo:   departmentTo   || null,
      requestingUser: requestingUser || null,
      team:           team           || null,
      requestingFor:  requestingFor  || null,
      requestDate:    requestDate ? new Date(requestDate) : new Date(),
      requiredDate:   requiredDate ? new Date(requiredDate) : null,
      requiredDays:   requiredDays   || null,
      storeName:      storeName      || null,
      bomPartName:    bomPartName    || null,
      vehicleName:    vehicleName    || null,
      remarks:        remarks        || null,
      status:         status         || 'Pending',
      updatedBy:      updatedBy      || 'Admin',
    };

    const record = await MRModel.updateMaterialRequest(req.db, id, headerData, buildDetailRows(items));
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Material request not found');
    }
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await MRModel.deleteMaterialRequest(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Material request not found');
    }
    throw err;
  }
};
