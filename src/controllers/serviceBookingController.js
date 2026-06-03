import * as Model from '../models/serviceBookingModel.js';

export const getAll = async (req, res) => {
  try {
    const data = await Model.getAll(req.db);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[serviceBooking] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { 
      bookingId, bookingDate, customerName, customerCode, 
      customerVehicleCount, vehicleSerialNo, serialNo, vehicleNo, 
      serviceJobNo, vehicleModelNo, modelSubType, vehicleName, 
      status, remarks 
    } = req.body;

    if (!bookingId || !bookingDate || !customerName || !serviceJobNo || !vehicleModelNo || !modelSubType || !vehicleName) {
      return res.status(400).json({ success: false, message: 'Required fields are missing' });
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
      remarks: remarks || null
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error('[serviceBooking] create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { 
      bookingId, bookingDate, customerName, customerCode, 
      customerVehicleCount, vehicleSerialNo, serialNo, vehicleNo, 
      serviceJobNo, vehicleModelNo, modelSubType, vehicleName, 
      status, remarks 
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
      remarks: remarks || null
    });
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    console.error('[serviceBooking] update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await Model.remove(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    console.error('[serviceBooking] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
