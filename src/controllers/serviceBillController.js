import * as Model from '../models/serviceBillModel.js';
import { BadRequestError, NotFoundError, ForbiddenError } from "../middlewares/customErrors.js";
import { getActorContext } from '../utils/actorContext.js';
import { broadcastEvent } from '../services/socketService.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';

export const getNextRef = async (req, res, next) => {
  try {
    const data = await Model.getNextServiceBillRefNo(req.db);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await Model.getAllServiceBills(req.db, page, limit);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await Model.getServiceBillById(req.db, id);
    if (!data) {
      throw new NotFoundError('Service Bill not found');
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const { items, ...header } = req.body;
    if (!header.refNo) {
      throw new BadRequestError('refNo is required');
    }

    const data = await Model.createServiceBill(req.db, header, items);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { items, ...header } = req.body;

    // Remove id/createdAt/updatedAt from header if they exist
    delete header.id;
    delete header.createdAt;
    delete header.updatedAt;

    const data = await Model.updateServiceBill(req.db, id, header, items);
    res.json({ success: true, data });
  } catch (err) {
    if (err.code === 'P2025') {
      next(new NotFoundError('Service Bill not found'));
    } else {
      next(err);
    }
  }
};

export const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await Model.deleteServiceBill(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      next(new NotFoundError('Service Bill not found'));
    } else {
      next(err);
    }
  }
};

export const requestCancel = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const actorContext = await getActorContext(req);
    const data = await Model.requestBillCancellation(req.db, id, actorContext);
    
    // Broadcast status change real-time
    broadcastEvent(SOCKET_EVENTS.SERVICE_BILL_STATUS_UPDATED, { id, status: data.status });
    
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const approveCancel = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (req.user.role?.toLowerCase() !== 'admin') {
      throw new ForbiddenError('Only administrators can approve cancellation requests');
    }
    const actorContext = await getActorContext(req);
    const data = await Model.approveBillCancellation(req.db, id, actorContext);
    
    // Broadcast status change real-time
    broadcastEvent(SOCKET_EVENTS.SERVICE_BILL_STATUS_UPDATED, { id, status: data.status });
    
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
