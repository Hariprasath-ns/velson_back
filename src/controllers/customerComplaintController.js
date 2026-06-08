import * as CustomerComplaintModel from '../models/customerComplaintModel.js';
import multer from 'multer';
import { BadRequestError, NotFoundError, ConflictError } from "../middelwares/customErrors.js";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, /^image\/(jpeg|png|gif|webp)$/.test(file.mimetype));
  },
});

const getFinancialYear = (date = new Date()) => {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const startYear = month >= 4 ? year : year - 1;
  const endYear = startYear + 1;
  const yy = String(startYear).slice(-2);
  const nextYY = String(endYear).slice(-2);
  return `${yy}-${nextYY}`;
};

export const getAll = async (req, res) => {
  try {
    const data = await CustomerComplaintModel.getAllComplaints(req.db);
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

export const getNextCode = async (req, res) => {
  try {
    const year = req.query.year || getFinancialYear();
    const nextCode = await CustomerComplaintModel.getNextCCNo(req.db, year);
    res.json({ success: true, nextCode });
  } catch (err) {
    throw err;
  }
};

export const getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await CustomerComplaintModel.getComplaintById(req.db, id);
    if (!data) {
      throw new NotFoundError('Complaint not found');
    }
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const {
      ccNo, recDate, customerName, customerCode, complainantName, modelNo,
      siteAddress, whatsappLocation, openingComplaint, serialNo, designation,
      mobileNo, alternateNo, emailId, complaintType, serviceType,
      workCompleteDate, complaintClosedDate, natureOfComplaint, actionThrough,
      attenderName, attenDate, finalDate, actionTaken, preventiveMeasure,
      feedbackSatisfaction, status, vehicleCount, createdBy
    } = req.body;

    if (!customerName || !customerName.trim()) {
      throw new BadRequestError('customerName is required');
    }

    const resolvedCcNo = ccNo && ccNo.trim()
      ? ccNo.trim()
      : await CustomerComplaintModel.getNextCCNo(req.db, getFinancialYear());

    const record = await CustomerComplaintModel.createComplaint(req.db, {
      ccNo: resolvedCcNo,
      recDate: recDate || null,
      customerName: customerName.trim(),
      customerCode: customerCode || null,
      complainantName: complainantName || null,
      modelNo: modelNo || null,
      siteAddress: siteAddress || null,
      whatsappLocation: whatsappLocation || null,
      openingComplaint: openingComplaint || null,
      serialNo: serialNo || null,
      designation: designation || null,
      mobileNo: mobileNo || null,
      alternateNo: alternateNo || null,
      emailId: emailId || null,
      complaintType: complaintType || null,
      serviceType: serviceType || null,
      workCompleteDate: workCompleteDate || null,
      complaintClosedDate: complaintClosedDate || null,
      natureOfComplaint: natureOfComplaint || null,
      actionThrough: actionThrough || null,
      attenderName: attenderName || null,
      attenDate: attenDate || null,
      finalDate: finalDate || null,
      actionTaken: actionTaken || null,
      preventiveMeasure: preventiveMeasure || null,
      feedbackSatisfaction: feedbackSatisfaction || null,
      status: status || 'Open',
      vehicleCount: vehicleCount ? String(vehicleCount) : null,
      createdBy: createdBy || 'Admin',
      updatedBy: createdBy || 'Admin'
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ConflictError('Complaint number (ccNo) already exists');
    }
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      ccNo, recDate, customerName, customerCode, complainantName, modelNo,
      siteAddress, whatsappLocation, openingComplaint, serialNo, designation,
      mobileNo, alternateNo, emailId, complaintType, serviceType,
      workCompleteDate, complaintClosedDate, natureOfComplaint, actionThrough,
      attenderName, attenDate, finalDate, actionTaken, preventiveMeasure,
      feedbackSatisfaction, status, vehicleCount, updatedBy
    } = req.body;

    if (!customerName || !customerName.trim()) {
      throw new BadRequestError('customerName is required');
    }

    const record = await CustomerComplaintModel.updateComplaint(req.db, id, {
      ccNo: ccNo || undefined,
      recDate: recDate || null,
      customerName: customerName.trim(),
      customerCode: customerCode || null,
      complainantName: complainantName || null,
      modelNo: modelNo || null,
      siteAddress: siteAddress || null,
      whatsappLocation: whatsappLocation || null,
      openingComplaint: openingComplaint || null,
      serialNo: serialNo || null,
      designation: designation || null,
      mobileNo: mobileNo || null,
      alternateNo: alternateNo || null,
      emailId: emailId || null,
      complaintType: complaintType || null,
      serviceType: serviceType || null,
      workCompleteDate: workCompleteDate || null,
      complaintClosedDate: complaintClosedDate || null,
      natureOfComplaint: natureOfComplaint || null,
      actionThrough: actionThrough || null,
      attenderName: attenderName || null,
      attenDate: attenDate || null,
      finalDate: finalDate || null,
      actionTaken: actionTaken || null,
      preventiveMeasure: preventiveMeasure || null,
      feedbackSatisfaction: feedbackSatisfaction || null,
      status: status || 'Open',
      vehicleCount: vehicleCount ? String(vehicleCount) : null,
      updatedBy: updatedBy || 'Admin'
    });

    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Complaint not found');
    }
    if (err.code === 'P2002') {
      throw new ConflictError('Complaint number (ccNo) already exists');
    }
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await CustomerComplaintModel.deleteComplaint(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Complaint not found');
    }
    throw err;
  }
};

export const uploadFiles = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!req.files || req.files.length === 0) {
      throw new BadRequestError('No files uploaded');
    }

    const uploadedImages = [];
    for (const file of req.files) {
      const img = await CustomerComplaintModel.addComplaintImage(
        req.db,
        id,
        file.originalname,
        file.buffer,
        file.mimetype
      );
      uploadedImages.push({
        id: img.id,
        name: img.name,
        imageMimeType: img.imageMimeType
      });
    }

    res.json({ success: true, data: uploadedImages });
  } catch (err) {
    throw err;
  }
};

export const downloadImage = async (req, res) => {
  try {
    const imageId = parseInt(req.params.imageId, 10);
    const img = await req.db.customerComplaintImage.findUnique({
      where: { id: imageId }
    });
    if (!img) {
      throw new NotFoundError('Image not found');
    }
    res.set('Content-Type', img.imageMimeType || 'image/jpeg');
    res.set('Content-Disposition', `inline; filename="${img.name || 'image'}"`);
    res.send(img.imageData);
  } catch (err) {
    throw err;
  }
};

export const removeImage = async (req, res) => {
  try {
    const imageId = parseInt(req.params.imageId, 10);
    await CustomerComplaintModel.deleteComplaintImage(req.db, imageId);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Image not found');
    }
    throw err;
  }
};
