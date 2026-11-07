import * as Model from '../models/qcInspectionCharModel.js';
import { BadRequestError, NotFoundError } from '../middlewares/customErrors.js';

const buildData = (body) => ({
  docNo: body.docNo || null,
  itemType: body.itemType || null,
  brand: body.brand || null,
  partNo: body.partNo?.trim() || null,
  partName: body.partName?.trim() || null,
  uom: body.uom?.trim() || null,
  rmChar: body.rmChar || body.characteristics || null,
  tolerance: body.tolerance?.trim() || null,
  minValue: body.minValue ?? body.min ?? null,
  maxValue: body.maxValue ?? body.max ?? null,
  equal: body.equal?.trim() || null,
  text: body.text?.trim() || null,
  checkMethod: body.checkMethod || null,
  specification: body.specification?.trim() || null,
  specType: body.specType || null,
  orderNo: body.orderNo ? String(body.orderNo) : null,
  revNo: body.revNo || 'R1',
  revDated: body.revDated || new Date().toISOString().slice(0, 10),
  status: body.status || 'Active',
  createdBy: body.createdBy || 'Admin',
  updatedBy: body.updatedBy || 'Admin',
});

export const getAll = async (req, res) => {
  try {
    const { search = '', partNo = '' } = req.query;
    const data = await Model.getAll(req.db, { search, partNo });
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

export const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await Model.getById(req.db, id);
    if (!data) throw new NotFoundError('Record not found');
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const { partNo } = req.body;
    if (!partNo) {
      throw new BadRequestError('Part No is required');
    }

    const data = buildData(req.body);
    if (!data.docNo) {
      const count = await req.db.qCInspectionChar.count();
      data.docNo = `DOC-${String(count + 1).padStart(3, '0')}`;
    }

    const record = await Model.create(req.db, data);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await Model.getById(req.db, id);
    if (!existing) throw new NotFoundError('Record not found');

    const data = buildData(req.body);
    const record = await Model.update(req.db, id, data);
    res.json({ success: true, data: record });
  } catch (err) {
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await Model.remove(req.db, id);
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (err) {
    throw err;
  }
};
