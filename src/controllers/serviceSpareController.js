import * as Model from '../models/serviceSpareModel.js';
import { BadRequestError, NotFoundError } from "../middelwares/customErrors.js";
import { eventBus } from '../services/eventBus.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';
import { getActorContext } from '../utils/actorContext.js';

export const getAll = async (req, res) => {
  try {
    const data = await Model.getAll(req.db);
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const {
      serviceJobNo,
      bookingCustomerCode,
      customerName,
      customerCode,
      displayOrder,
      displayDate,
      lastSavedAssName,
      servicePartNo,
      vehicleNo,
      serialNo,
      vehicleModelNo,
      modelSubType,
      vehicleName,
      status,
      selectedParts,
      totalAmount,
      savedDate,
      items
    } = req.body;

    if (!serviceJobNo) {
      throw new BadRequestError('serviceJobNo is required');
    }

    const record = await Model.create(req.db, {
      serviceJobNo,
      bookingCustomerCode: bookingCustomerCode || null,
      customerName: customerName || null,
      customerCode: customerCode || null,
      displayOrder: displayOrder ? parseInt(displayOrder, 10) : 1,
      displayDate: displayDate || null,
      lastSavedAssName: lastSavedAssName || null,
      servicePartNo: servicePartNo || null,
      vehicleNo: vehicleNo || null,
      serialNo: serialNo || null,
      vehicleModelNo: vehicleModelNo || null,
      modelSubType: modelSubType || null,
      vehicleName: vehicleName || null,
      status: status || 'Open',
      selectedParts: Array.isArray(selectedParts) ? selectedParts.map(id => parseInt(id, 10)) : [],
      totalAmount: totalAmount ? parseFloat(totalAmount) : 0,
      savedDate: savedDate || null,
      items
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      serviceJobNo,
      bookingCustomerCode,
      customerName,
      customerCode,
      displayOrder,
      displayDate,
      lastSavedAssName,
      servicePartNo,
      vehicleNo,
      serialNo,
      vehicleModelNo,
      modelSubType,
      vehicleName,
      status,
      selectedParts,
      totalAmount,
      savedDate,
      items
    } = req.body;

    const record = await Model.update(req.db, id, {
      serviceJobNo,
      bookingCustomerCode: bookingCustomerCode || null,
      customerName: customerName || null,
      customerCode: customerCode || null,
      displayOrder: displayOrder ? parseInt(displayOrder, 10) : undefined,
      displayDate: displayDate || null,
      lastSavedAssName: lastSavedAssName || null,
      servicePartNo: servicePartNo || null,
      vehicleNo: vehicleNo || null,
      serialNo: serialNo || null,
      vehicleModelNo: vehicleModelNo || null,
      modelSubType: modelSubType || null,
      vehicleName: vehicleName || null,
      status: status || 'Open',
      selectedParts: Array.isArray(selectedParts) ? selectedParts.map(id => parseInt(id, 10)) : undefined,
      totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
      savedDate: savedDate || null,
      items
    });

    const actorContext = await getActorContext(req);
    eventBus.publish(SOCKET_EVENTS.SERVICE_SPARE_UPDATED, {
      referenceId: record.id,
      referenceNumber: record.serviceJobNo,
      referenceType: "service-spare",
      serviceJobNo: record.serviceJobNo,
      userId: req.user?.id,
      actorContext
    });

    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Record not found');
    }
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await Model.remove(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Record not found');
    }
    throw err;
  }
};
