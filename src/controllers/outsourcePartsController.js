import * as OutsourcePartsModel from '../models/outsourcePartsModel.js';
import { BadRequestError, NotFoundError, ConflictError } from "../middelwares/customErrors.js";

const toInt = (v) => (v !== '' && v != null ? parseInt(v, 10) || null : null);

const buildDetailRows = (items = []) =>
  items.map((item) => ({
    slNo: toInt(item.slNo) || 1,
    itemName: item.itemName || '',
    entryDate: item.entryDate ? new Date(item.entryDate) : new Date()
  }));

export const getAll = async (req, res) => {
  try {
    const data = await OutsourcePartsModel.getAllOutsourceParts(req.db);
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

export const getById = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) {
      throw new BadRequestError('Invalid ID');
    }
    const record = await OutsourcePartsModel.getOutsourcePartsById(req.db, id);
    if (!record) {
      throw new NotFoundError('Outsource Parts register entry not found');
    }
    res.json({ success: true, data: record });
  } catch (err) {
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const {
      dcNo,
      dcDate,
      customerId,
      partyName,
      address,
      items,
      createdBy
    } = req.body;

    if (!dcNo) {
      throw new BadRequestError('dcNo is required');
    }
    if (!partyName) {
      throw new BadRequestError('partyName is required');
    }

    const detailRows = buildDetailRows(items);
    const auditUser = req.user?.username || createdBy || 'Admin';

    const headerData = {
      dcNo: dcNo.trim(),
      dcDate: dcDate ? new Date(dcDate) : new Date(),
      customerId: customerId ? toInt(customerId) : null,
      partyName: partyName.trim(),
      address: address || null,
      createdBy: auditUser,
      updatedBy: auditUser
    };

    const record = await OutsourcePartsModel.createOutsourceParts(req.db, headerData, detailRows);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ConflictError('Outsource Parts register with this DC No already exists');
    }
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) {
      throw new BadRequestError('Invalid ID');
    }

    const {
      dcNo,
      dcDate,
      customerId,
      partyName,
      address,
      items,
      updatedBy
    } = req.body;

    if (!dcNo) {
      throw new BadRequestError('dcNo is required');
    }
    if (!partyName) {
      throw new BadRequestError('partyName is required');
    }

    const recordExists = await OutsourcePartsModel.getOutsourcePartsById(req.db, id);
    if (!recordExists) {
      throw new NotFoundError('Outsource Parts register entry not found');
    }

    const detailRows = buildDetailRows(items);
    const auditUser = req.user?.username || updatedBy || 'Admin';

    const headerData = {
      dcNo: dcNo.trim(),
      dcDate: dcDate ? new Date(dcDate) : new Date(),
      customerId: customerId ? toInt(customerId) : null,
      partyName: partyName.trim(),
      address: address || null,
      updatedBy: auditUser
    };

    const record = await OutsourcePartsModel.updateOutsourceParts(req.db, id, headerData, detailRows);
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ConflictError('Outsource Parts register with this DC No already exists');
    }
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) {
      throw new BadRequestError('Invalid ID');
    }
    const recordExists = await OutsourcePartsModel.getOutsourcePartsById(req.db, id);
    if (!recordExists) {
      throw new NotFoundError('Outsource Parts register entry not found');
    }
    await OutsourcePartsModel.deleteOutsourceParts(req.db, id);
    res.json({ success: true, message: 'Outsource Parts register entry deleted successfully' });
  } catch (err) {
    throw err;
  }
};
