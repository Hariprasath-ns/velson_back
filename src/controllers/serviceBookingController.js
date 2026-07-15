import * as Model from '../models/serviceBookingModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middlewares/customErrors.js";
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
      bookingId, bookingDate, customerName, customerCode, 
      customerVehicleCount, vehicleSerialNo, serialNo, vehicleNo, 
      serviceJobNo, vehicleModelNo, modelSubType, vehicleName, 
      status, tempStatus, remarks 
    } = req.body;

    if (!bookingId || !bookingDate || !customerName || !serviceJobNo || !vehicleModelNo || !modelSubType || !vehicleName) {
      throw new BadRequestError('Required fields are missing');
    }

    const record = await Model.create(req.db, {
      bookingId: parseInt(bookingId, 10),
      bookingDate,
      customerName,
      customerCode: customerCode || null,
      customerVehicleCount: parseInt(customerVehicleCount, 10) || 1,
      vehicleSerialNo: vehicleSerialNo || null,
      serialNo: serialNo || null,
      vehicleNo: vehicleNo || null,
      serviceJobNo,
      vehicleModelNo,
      modelSubType,
      vehicleName,
      status: status || 'Pending',
      tempStatus: tempStatus || 'Open',
      remarks: remarks || null
    });

    const actorContext = await getActorContext(req);
    eventBus.publish(SOCKET_EVENTS.SERVICE_CREATED, {
      referenceId: record.id,
      referenceNumber: record.serviceJobNo,
      referenceType: "service-booking",
      serviceJobNo: record.serviceJobNo,
      vehicleNo: record.vehicleNo || "N/A",
      userId: req.user?.id,
      actorContext
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
      bookingId, bookingDate, customerName, customerCode, 
      customerVehicleCount, vehicleSerialNo, serialNo, vehicleNo, 
      serviceJobNo, vehicleModelNo, modelSubType, vehicleName, 
      status, tempStatus, remarks 
    } = req.body;

    const record = await Model.update(req.db, id, {
      bookingId: bookingId ? parseInt(bookingId, 10) : undefined,
      bookingDate,
      customerName,
      customerCode: customerCode || null,
      customerVehicleCount: customerVehicleCount ? parseInt(customerVehicleCount, 10) : undefined,
      vehicleSerialNo: vehicleSerialNo || null,
      serialNo: serialNo || null,
      vehicleNo: vehicleNo || null,
      serviceJobNo,
      vehicleModelNo,
      modelSubType,
      vehicleName,
      status,
      tempStatus,
      remarks: remarks || null
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
