import * as PrefixModel from '../models/prefixModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middelwares/customErrors.js";


export const getAll = async (req, res) => {
  try {
    const data = await PrefixModel.getAllPrefixes(req.db);
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const { prefixCode } = req.body;
    if (!prefixCode || !prefixCode.trim()) {
      throw new BadRequestError('prefixCode is required');
    }
    const record = await PrefixModel.createPrefix(req.db, {
      prefixCode: prefixCode.trim().toUpperCase(),
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ConflictError(`Prefix "${req.body.prefixCode}" already exists.`);
    }
    
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { prefixCode } = req.body;
    if (!prefixCode || !prefixCode.trim()) {
      throw new BadRequestError('prefixCode is required');
    }
    const record = await PrefixModel.updatePrefix(req.db, id, {
      prefixCode: prefixCode.trim().toUpperCase(),
    });
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Prefix not found');
    }
    if (err.code === 'P2002') {
      throw new ConflictError(`Prefix "${req.body.prefixCode}" already exists.`);
    }
    
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await PrefixModel.deletePrefix(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Prefix not found');
    }
    
    throw err;
  }
};
