import * as Model from '../models/materialIssueModel.js';
import { BadRequestError } from '../middlewares/customErrors.js';
import { getActorContext } from '../utils/actorContext.js';
import { checkBookingNotClosed } from '../utils/bookingCheck.js';

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
    if (!serviceJobNo && !servicePartNo) {
      throw new BadRequestError('serviceJobNo or servicePartNo is required');
    }
    const partNoParam = (servicePartNo === '(Unassigned)' || servicePartNo === 'null' || !servicePartNo) ? null : servicePartNo;
    const data = await Model.getBOMItems(req.db, partNoParam, serviceJobNo);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getIssuedItems = async (req, res, next) => {
  try {
    const { servicePartNo, serviceJobNo } = req.query;
    if (!serviceJobNo && !servicePartNo) {
      throw new BadRequestError('serviceJobNo or servicePartNo is required');
    }
    const partNoParam = (servicePartNo === '(Unassigned)' || servicePartNo === 'null' || !servicePartNo) ? null : servicePartNo;
    const data = await Model.getIssuedItems(req.db, partNoParam, serviceJobNo);
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
    if (!header) {
      throw new BadRequestError('header is required');
    }
    if (!details || !Array.isArray(details) || details.length === 0) {
      throw new BadRequestError('details array with at least one item is required');
    }

    // Check if Booking Entry is closed against this serviceJobNo
    const jobNoToCheck = header.serviceJobNo || details.find(d => d.serviceJobNo)?.serviceJobNo;
    if (jobNoToCheck) {
      await checkBookingNotClosed(req.db, jobNoToCheck);
    }
    if (!header.issueNo) {
      const nextNo = await Model.getNextIssueNo(req.db);
      header.issueNo = nextNo.issueNo;
    }
    for (const d of details) {
      if (!d.partNo) {
        throw new BadRequestError('partNo is required for all detail items');
      }
      const q = Number(d.currentIssuedQty ?? d.qty);
      if (isNaN(q) || q <= 0) {
        throw new BadRequestError(`Invalid issue quantity for part ${d.partNo}: must be greater than 0. Negative or zero quantities are not allowed.`);
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

export const deductStock = async (req, res, next) => {
  try {
    const { partNo, barcode, qty, source, sourceId } = req.body;
    const data = await Model.deductBarcodeStock(req.db, { partNo, barcode, qty, source, sourceId });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const restoreStock = async (req, res, next) => {
  try {
    const { partNo, barcode, qty, source, sourceId } = req.body;
    const data = await Model.restoreBarcodeStock(req.db, { partNo, barcode, qty, source, sourceId });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};



