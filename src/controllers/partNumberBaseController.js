import * as PNBModel from '../models/partNumberBaseModel.js';

export const getAll = async (req, res) => {
  try {
    const data = await PNBModel.getAllPartNumberBases(req.db);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[partNumberBase] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { categoryId, subCategoryId, prefixCode, digitCount, startingNumber, endingNumber, isActive } = req.body;

    if (!categoryId)    return res.status(400).json({ success: false, message: 'categoryId is required' });
    if (!subCategoryId) return res.status(400).json({ success: false, message: 'subCategoryId is required' });
    if (!prefixCode?.trim()) return res.status(400).json({ success: false, message: 'prefixCode is required' });
    if (!digitCount || Number(digitCount) < 1)
      return res.status(400).json({ success: false, message: 'digitCount must be a positive number' });

    const start = Number(startingNumber);
    const end   = Number(endingNumber);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ success: false, message: 'startingNumber and endingNumber must be numbers' });
    }
    if (end <= start) {
      return res.status(400).json({ success: false, message: 'endingNumber must be greater than startingNumber' });
    }

    const totalNumbers = end - start;
    const record = await PNBModel.createPartNumberBase(req.db, {
      categoryId:           Number(categoryId),
      subCategoryId:        Number(subCategoryId),
      prefixCode:           prefixCode.trim().toUpperCase(),
      digitCount:           Number(digitCount),
      startingNumber:       start,
      endingNumber:         end,
      currentRunningNumber: start,
      totalNumbers,
      isActive:             isActive !== false,
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error('[partNumberBase] create error:', err);
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Duplicate entry — prefix or subcategory already configured' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { categoryId, subCategoryId, prefixCode, digitCount, startingNumber, endingNumber, isActive } = req.body;

    if (!categoryId)    return res.status(400).json({ success: false, message: 'categoryId is required' });
    if (!subCategoryId) return res.status(400).json({ success: false, message: 'subCategoryId is required' });
    if (!prefixCode?.trim()) return res.status(400).json({ success: false, message: 'prefixCode is required' });
    if (!digitCount || Number(digitCount) < 1)
      return res.status(400).json({ success: false, message: 'digitCount must be a positive number' });

    const start = Number(startingNumber);
    const end   = Number(endingNumber);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ success: false, message: 'startingNumber and endingNumber must be numbers' });
    }
    if (end <= start) {
      return res.status(400).json({ success: false, message: 'endingNumber must be greater than startingNumber' });
    }

    const totalNumbers = end - start;
    const record = await PNBModel.updatePartNumberBase(req.db, id, {
      categoryId:     Number(categoryId),
      subCategoryId:  Number(subCategoryId),
      prefixCode:     prefixCode.trim().toUpperCase(),
      digitCount:     Number(digitCount),
      startingNumber: start,
      endingNumber:   end,
      totalNumbers,
      isActive:       isActive !== false,
    });
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    console.error('[partNumberBase] update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await PNBModel.deletePartNumberBase(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    console.error('[partNumberBase] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const generatePartNumber = async (req, res) => {
  try {
    const { prefix } = req.body;
    if (!prefix?.trim()) {
      return res.status(400).json({ success: false, message: 'prefix is required' });
    }
    const result = await PNBModel.generatePartNumberTx(req.db, prefix.trim().toUpperCase());
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[partNumberBase] generatePartNumber error:', err);
    const isLimitError = err.message?.includes('limit exceeded') || err.message?.includes('No active');
    res.status(isLimitError ? 422 : 500).json({ success: false, message: err.message });
  }
};

export const previewPartNumber = async (req, res) => {
  try {
    const prefix = req.query.prefix?.trim().toUpperCase();
    if (!prefix) {
      return res.status(400).json({ success: false, message: 'prefix query param is required' });
    }
    const result = await PNBModel.previewNextPartNumber(req.db, prefix);
    if (!result) {
      return res.status(404).json({ success: false, message: `No active PartNumberBase for prefix "${prefix}"` });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[partNumberBase] previewPartNumber error:', err);
    const isLimitError = err.message?.includes('limit exceeded');
    res.status(isLimitError ? 422 : 500).json({ success: false, message: err.message });
  }
};
