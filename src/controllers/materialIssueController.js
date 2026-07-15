import * as Model from '../models/materialIssueModel.js';
import { BadRequestError } from '../middlewares/customErrors.js';
import { getActorContext } from '../utils/actorContext.js';

export const getNextNo = async (req, res, next) => {
  try {
    const data = await Model.getNextIssueNo(req.db);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getBOMItems = async (req, res, next) => {
  try {
    const { servicePartNo, serviceJobNo } = req.query;
    if (!serviceJobNo) {
      throw new BadRequestError('serviceJobNo is a required parameter');
    }
    const partNoParam = (servicePartNo === '(Unassigned)' || servicePartNo === 'null' || !servicePartNo) ? null : servicePartNo;
    const data = await Model.getBOMItems(req.db, partNoParam, serviceJobNo);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getBarcodes = async (req, res, next) => {
  try {
    const { partNo } = req.query;
    if (!partNo) {
      throw new BadRequestError('partNo is a required parameter');
    }
    const data = await Model.getBarcodes(req.db, partNo);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const createIssue = async (req, res, next) => {
  try {
    const { header, details } = req.body;
    if (!header || !details || !Array.isArray(details)) {
      throw new BadRequestError('header and details array are required');
    }
    if (!header.issueNo || !header.serviceJobNo || !header.servicePartNo) {
      throw new BadRequestError('issueNo, serviceJobNo, and servicePartNo are required in header');
    }
    for (const d of details) {
      if (!d.partNo || !d.barcode || !d.currentIssuedQty || !d.source || !d.sourceId) {
        throw new BadRequestError('partNo, barcode, currentIssuedQty, source, and sourceId are required for all detail items');
      }
    }

    const actorContext = await getActorContext(req);
    const record = await Model.createIssue(req.db, { header, details }, actorContext);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

export const getAllIssues = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await Model.getAllIssues(req.db, page, limit);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getBarcodeDetails = async (req, res, next) => {
  try {
    const { barcode } = req.params;
    if (!barcode) {
      throw new BadRequestError('barcode is a required parameter');
    }
    const data = await Model.getBarcodeDetails(req.db, barcode);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Barcode not found' });
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};



