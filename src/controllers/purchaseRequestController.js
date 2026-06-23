import * as PRModel from '../models/purchaseRequestModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middelwares/customErrors.js";
import { eventBus } from '../services/eventBus.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';
import { getActorContext } from '../utils/actorContext.js';


const toFloat = (v) => (v !== '' && v != null ? parseFloat(v) || 0 : 0);
const toInt   = (v) => (v !== '' && v != null ? parseInt(v, 10) || null : null);

const buildDetailRows = (items = []) =>
  items.map((item) => ({
    itemId:        item.itemId ? parseInt(item.itemId, 10) : null,
    itemCode:      item.itemCode      || null,
    itemName:      item.itemName      || null,
    specification: item.specification || null,
    jobNo:         item.jobNo         || null,
    machineNo:     item.machineNo     || null,
    uom:           item.uom           || null,
    qty:           toFloat(item.qty),
    eta:           item.eta ? new Date(item.eta) : null,
    purpose:       item.purpose       || null,
  }));

export const getNextNo = async (req, res) => {
  try {
    const result = await PRModel.getNextPrNo(req.db);
    res.json({ success: true, ...result });
  } catch (err) {
    
    throw err;
  }
};

export const getAll = async (req, res) => {
  try {
    const data = await PRModel.getAllPurchaseRequests(req.db);
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await PRModel.getPurchaseRequestById(req.db, id);
    if (!data) throw new NotFoundError('Purchase request not found');
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const {
      prNo, financialYear, prDate, requiredDate,
      department, departmentId,
      requestingUser,
      team, teamId,
      requestingFor, requestingForId, remarks, status, createdBy, items,
    } = req.body;

    if (!prNo) {
      throw new BadRequestError('prNo is required');
    }

    const headerData = {
      prNo:             prNo.trim(),
      financialYear:    financialYear    || '',
      prDate:           prDate ? new Date(prDate) : new Date(),
      requiredDate:     requiredDate ? new Date(requiredDate) : null,
      department:       department       || null,
      departmentId:     toInt(departmentId),
      requestingUser:   requestingUser   || null,
      team:             team             || null,
      teamId:           toInt(teamId),
      requestingFor:    requestingFor    || null,
      requestingForId:  toInt(requestingForId),
      remarks:          remarks          || null,
      status:           status           || 'Draft',
      createdBy:        createdBy        || 'Admin',
      updatedBy:        createdBy        || 'Admin',
    };

    const record = await PRModel.createPurchaseRequest(req.db, headerData, buildDetailRows(items));

    const actorContext = await getActorContext(req);
    eventBus.publish(SOCKET_EVENTS.PURCHASE_REQUEST_CREATED, {
      referenceId: record.id,
      referenceNumber: record.prNo,
      referenceType: "purchase-request",
      prNo: record.prNo,
      createdBy: record.createdBy || 'Admin',
      userId: req.user?.id,
      actorContext
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ConflictError('Purchase request number already exists');
    }
    if (err.code === 'P2003') {
      throw new BadRequestError('Invalid department or team reference');
    }
    
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      prDate, requiredDate,
      department, departmentId,
      requestingUser,
      team, teamId,
      requestingFor, requestingForId, remarks, status, poNo, poDate, updatedBy, items,
    } = req.body;

    const headerData = {
      prDate:           prDate ? new Date(prDate) : new Date(),
      requiredDate:     requiredDate ? new Date(requiredDate) : null,
      department:       department       || null,
      departmentId:     toInt(departmentId),
      requestingUser:   requestingUser   || null,
      team:             team             || null,
      teamId:           toInt(teamId),
      requestingFor:    requestingFor    || null,
      requestingForId:  toInt(requestingForId),
      remarks:          remarks          || null,
      status:           status           || 'Draft',
      ...(poNo  !== undefined && { poNo:  poNo  || null }),
      ...(poDate !== undefined && { poDate: poDate ? new Date(poDate) : null }),
      updatedBy:        updatedBy        || 'Admin',
    };

    const original = await PRModel.getPurchaseRequestById(req.db, id);
    const record = await PRModel.updatePurchaseRequest(req.db, id, headerData, buildDetailRows(items));

    const actorContext = await getActorContext(req);
    if (original && original.status !== record.status && record.status === 'Approved') {
      eventBus.publish(SOCKET_EVENTS.PURCHASE_REQUEST_APPROVED, {
        referenceId: record.id,
        referenceNumber: record.prNo,
        referenceType: "purchase-request",
        prNo: record.prNo,
        userId: req.user?.id,
        actorContext
      });
    }

    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Purchase request not found');
    }
    if (err.code === 'P2003') {
      throw new BadRequestError('Invalid department or team reference');
    }
    
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await PRModel.deletePurchaseRequest(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Purchase request not found');
    }
    
    throw err;
  }
};
