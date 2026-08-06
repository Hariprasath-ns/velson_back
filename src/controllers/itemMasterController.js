import { fileURLToPath } from 'url';
import path from 'path';
import multer from 'multer';
import * as ItemMasterModel from '../models/itemMasterModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middlewares/customErrors.js";
import { eventBus } from '../services/eventBus.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';
import { getActorContext } from '../utils/actorContext.js';


const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'image') cb(null, /^image\/(jpeg|png|gif|webp)$/.test(file.mimetype));
    else if (file.fieldname === 'pdf') cb(null, file.mimetype === 'application/pdf');
    else cb(null, false);
  },
});

const parseOptInt = v => (v !== '' && v != null) ? parseInt(v, 10) : null;
const parseOptFloat = v => (v !== '' && v != null) ? parseFloat(v) : null;

const buildData = (body, isUpdate = false) => {
  const data = {
    groupId: parseOptInt(body.groupId),
    partNo: body.partNo?.trim(),
    outsourcePartNo: body.outsourcePartNo || null,
    partName: body.partName?.trim(),
    modelId: parseOptInt(body.modelId),
    brand: body.brand || null,
    description: body.description || null,
    size: body.size || null,
    weight: parseOptFloat(body.weight),
    unitId: parseOptInt(body.unitId),
    hsnCode: body.hsnCode || null,
    purchaseRate: parseOptFloat(body.purchaseRate),
    marginPercent: parseOptFloat(body.marginPercent),
    rate: parseOptFloat(body.rate),
    labourCharge: parseOptFloat(body.labourCharge),
    currencyId: parseOptInt(body.currencyId),
    taxId: parseOptInt(body.taxId),
    subGroupId: parseOptInt(body.subGroupId),
    storeId: parseOptInt(body.storeId),
    rackNo: body.rackNo || null,
    location: body.location || null,
    itemTypeId: parseOptInt(body.itemTypeId),
    qcTypeId: parseOptInt(body.qcTypeId),
    materialGradeId: parseOptInt(body.materialGradeId),
    materialTypeId: parseOptInt(body.materialTypeId),
    rawMaterialId: parseOptInt(body.rawMaterialId),
    rmLength: body.rmLength || null,
    rawMaterialWt: parseOptFloat(body.rawMaterialWt),
    fgMaterialWt: parseOptFloat(body.fgMaterialWt),
    reorderLevel: parseOptFloat(body.reorderLevel),
    minStock: parseOptFloat(body.minStock),
    routeCardNo: body.routeCardNo || null,
    barcodeType: body.barcodeType || null,
    remark: body.remark || null,
    rawMaterial: body.rawMaterial || null,
  };

  if (!isUpdate || body.imagePath !== undefined) data.imagePath = body.imagePath || null;
  if (!isUpdate || body.imageData !== undefined) data.imageData = body.imageData || null;
  if (!isUpdate || body.imageMimeType !== undefined) data.imageMimeType = body.imageMimeType || null;
  if (!isUpdate || body.pdfPath !== undefined) data.pdfPath = body.pdfPath || null;
  if (!isUpdate || body.pdfData !== undefined) data.pdfData = body.pdfData || null;
  if (!isUpdate || body.pdfMimeType !== undefined) data.pdfMimeType = body.pdfMimeType || null;

  if (isUpdate) {
    data.updatedBy = body.updatedBy || 'ADMIN';
  } else {
    data.createdBy = body.createdBy || 'ADMIN';
    data.updatedBy = body.updatedBy || 'ADMIN';
  }

  return data;
};

export const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const result = await ItemMasterModel.getItemMasters(req.db, { page, limit, search });
    res.json({ success: true, ...result });
  } catch (err) {
    
    throw err;
  }
};

export const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await ItemMasterModel.getItemMasterById(req.db, id);
    if (!data) throw new NotFoundError('Item not found');
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const { partNo, partName } = req.body;
    if (!partNo || !partName) {
      throw new BadRequestError('partNo and partName are required');
    }
    const record = await ItemMasterModel.createItemMaster(req.db, buildData(req.body, false));

    const actorContext = await getActorContext(req);

    eventBus.publish(SOCKET_EVENTS.ITEM_CREATED, {
      referenceId: record.id,
      referenceNumber: record.partNo,
      referenceType: "item-master",
      partNo: record.partNo,
      partName: record.partName,
      userId: req.user?.id,
      actorContext
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new BadRequestError('Part number already exists');
    }
    
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { partNo, partName } = req.body;
    if (!partNo || !partName) {
      throw new BadRequestError('partNo and partName are required');
    }
    const originalItem = await ItemMasterModel.getItemMasterById(req.db, id);
    const data = buildData(req.body, true);
    const record = await ItemMasterModel.updateItemMaster(req.db, id, data);

    const actorContext = await getActorContext(req);

    eventBus.publish(SOCKET_EVENTS.ITEM_UPDATED, {
      referenceId: record.id,
      referenceNumber: record.partNo,
      referenceType: "item-master",
      partNo: record.partNo,
      partName: record.partName,
      userId: req.user?.id,
      actorContext
    });

    if (originalItem && parseFloat(originalItem.purchaseRate) !== parseFloat(record.purchaseRate)) {
      eventBus.publish(SOCKET_EVENTS.ITEM_PRICE_UPDATED, {
        referenceId: record.id,
        referenceNumber: record.partNo,
        referenceType: "item-master",
        partNo: record.partNo,
        rate: record.purchaseRate,
        userId: req.user?.id,
        actorContext
      });
    }

    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Item not found');
    }
    if (err.code === 'P2002') {
      throw new BadRequestError('Part number already exists');
    }
    
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await ItemMasterModel.getItemMasterById(req.db, id);
    await ItemMasterModel.deleteItemMaster(req.db, id);

    if (item) {
      const actorContext = await getActorContext(req);
      eventBus.publish(SOCKET_EVENTS.ITEM_DELETED, {
        referenceId: id,
        referenceNumber: item.partNo,
        referenceType: "item-master",
        partNo: item.partNo,
        partName: item.partName,
        userId: req.user?.id,
        actorContext
      });
    }

    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Item not found');
    }
    
    throw err;
  }
};

export const uploadFiles = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const updateData = { updatedBy: req.body.updatedBy || 'ADMIN' };

    if (req.files?.image?.[0]) {
      updateData.imageData = req.files.image[0].buffer;
      updateData.imageMimeType = req.files.image[0].mimetype;
    }

    if (req.files?.pdf?.[0]) {
      updateData.pdfData = req.files.pdf[0].buffer;
      updateData.pdfMimeType = req.files.pdf[0].mimetype;
    }

    if (!req.files?.image?.[0] && !req.files?.pdf?.[0]) {
      throw new BadRequestError('No files uploaded');
    }

    await ItemMasterModel.updateItemMaster(req.db, id, updateData);

    const record = await ItemMasterModel.createUpload(req.db, {
      itemId: id,
      imageData: req.files?.image?.[0]?.buffer || null,
      imageMimeType: req.files?.image?.[0]?.mimetype || null,
      pdfData: req.files?.pdf?.[0]?.buffer || null,
      pdfMimeType: req.files?.pdf?.[0]?.mimetype || null,
      updatedBy: req.body.updatedBy || 'ADMIN',
    });
    res.json({ success: true, data: record });
  } catch (err) {
    
    throw err;
  }
};

export const getUploads = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await ItemMasterModel.getUploadsByItemId(req.db, id);
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const downloadImage = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await ItemMasterModel.getItemMasterById(req.db, id);

    if (!item || !item.imageData) {
      throw new NotFoundError('Image not found');
    }

    res.set('Content-Type', item.imageMimeType || 'image/jpeg');
    res.set('Content-Disposition', `inline; filename="item_${id}_image"`);
    res.send(item.imageData);
  } catch (err) {
    
    throw err;
  }
};

export const downloadPdf = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await ItemMasterModel.getItemMasterById(req.db, id);

    if (!item || !item.pdfData) {
      throw new NotFoundError('PDF not found');
    }

    res.set('Content-Type', item.pdfMimeType || 'application/pdf');
    res.set('Content-Disposition', `inline; filename="item_${id}_document.pdf"`);
    res.send(item.pdfData);
  } catch (err) {
    
    throw err;
  }
};

export const downloadUploadImage = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await ItemMasterModel.getUploadById(req.db, id);

    if (!item || !item.imageData) {
      throw new NotFoundError('Image not found');
    }

    res.set('Content-Type', item.imageMimeType || 'image/jpeg');
    res.set('Content-Disposition', `inline; filename="upload_${id}_image"`);
    res.send(item.imageData);
  } catch (err) {
    
    throw err;
  }
};

export const downloadUploadPdf = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await ItemMasterModel.getUploadById(req.db, id);

    if (!item || !item.pdfData) {
      throw new NotFoundError('PDF not found');
    }

    res.set('Content-Type', item.pdfMimeType || 'application/pdf');
    res.set('Content-Disposition', `inline; filename="upload_${id}_document.pdf"`);
    res.send(item.pdfData);
  } catch (err) {
    
    throw err;
  }
};
