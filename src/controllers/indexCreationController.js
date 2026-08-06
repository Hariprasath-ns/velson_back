import * as XLSX from 'xlsx';
import multer from 'multer';
import * as IndexModel from '../models/indexCreationModel.js';
import { BadRequestError, NotFoundError } from "../middlewares/customErrors.js";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'image') cb(null, /^image\/(jpeg|png|gif|webp)$/.test(file.mimetype));
    else cb(null, false);
  },
});


function parseExcelBase64(base64Str) {
  try {
    const wb = XLSX.read(base64Str, { type: 'base64' });
    const wsname = wb.SheetNames[0];
    if (!wsname) return [];
    const ws = wb.Sheets[wsname];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (data.length < 2) return [];
    const headers = data[0].map(h => h ? String(h).trim() : '');
    const rows = [];
    for (let i = 1; i < data.length; i++) {
      const rowArr = data[i];
      if (!rowArr || rowArr.length === 0 || rowArr.every(cell => !cell)) continue;
      const rowObj = {};
      headers.forEach((h, idx) => {
        if (h) {
          rowObj[h] = rowArr[idx] !== undefined && rowArr[idx] !== null ? String(rowArr[idx]).trim() : '';
        }
      });
      rows.push(rowObj);
    }
    return rows;
  } catch (err) {
    return [];
  }
}

export const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const record = await IndexModel.getIndexCreationById(req.db, id);
    if (!record) {
      throw new NotFoundError('Index record not found');
    }
    res.json({ success: true, data: record });
  } catch (err) {
    throw err;
  }
};

export const nextNo = async (req, res) => {
  try {
    const maxIndex = await req.db.indexCreation.aggregate({
      _max: { indexNo: true }
    });
    const nextIndexNo = (maxIndex._max.indexNo || 0) + 1;
    res.json({ success: true, nextNo: nextIndexNo });
  } catch (err) {
    throw err;
  }
};

export const getAll = async (req, res) => {
  try {
    const data = await IndexModel.getAllIndexCreations(req.db);
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const {
      date, model, modelNo, fileLocation, fileName, excelData, fileContentBase64, createdBy
    } = req.body;

    if (!model || !String(model).trim()) {
      throw new BadRequestError('model is required');
    }
    if (!modelNo || !String(modelNo).trim()) {
      throw new BadRequestError('modelNo is required');
    }

    // Auto-generate indexNo
    const maxIndex = await req.db.indexCreation.aggregate({
      _max: { indexNo: true }
    });
    const nextIndexNo = (maxIndex._max.indexNo || 0) + 1;

    // Parse Excel file on backend if base64 provided
    let parsedExcelData = null;
    if (excelData && Array.isArray(excelData) && excelData.length > 0) {
      parsedExcelData = excelData;
    } else if (fileContentBase64) {
      parsedExcelData = parseExcelBase64(fileContentBase64);
    }

    const record = await IndexModel.createIndexCreation(req.db, {
      date: date ? new Date(date) : new Date(),
      indexNo: nextIndexNo,
      model: String(model).trim(),
      modelNo: String(modelNo).trim(),
      fileLocation: fileLocation || null,
      fileName: fileName || null,
      createdBy: createdBy || 'Admin',
    }, parsedExcelData);

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new BadRequestError('Index No already exists');
    }
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      date, model, modelNo, fileLocation, fileName, excelData, fileContentBase64, updatedBy
    } = req.body;

    let parsedExcelData = undefined;
    if (excelData !== undefined) {
      parsedExcelData = excelData;
    } else if (fileContentBase64) {
      parsedExcelData = parseExcelBase64(fileContentBase64);
    }

    const updatePayload = {
      date: date ? new Date(date) : undefined,
      model: model ? String(model).trim() : undefined,
      modelNo: modelNo ? String(modelNo).trim() : undefined,
      fileLocation: fileLocation || null,
      fileName: fileName || null,
      updatedBy: updatedBy || 'Admin',
    };

    if (req.body.imagePath !== undefined) updatePayload.imagePath = req.body.imagePath;
    if (req.body.imageData !== undefined) updatePayload.imageData = req.body.imageData;
    if (req.body.imageMimeType !== undefined) updatePayload.imageMimeType = req.body.imageMimeType;

    const record = await IndexModel.updateIndexCreation(req.db, id, updatePayload, parsedExcelData);

    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Index record not found');
    }
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await IndexModel.deleteIndexCreation(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Index record not found');
    }
    throw err;
  }
};

export const uploadFiles = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updateData = {};

    if (req.files?.image?.[0]) {
      updateData.imageData = req.files.image[0].buffer;
      updateData.imageMimeType = req.files.image[0].mimetype;
      updateData.imagePath = req.files.image[0].originalname;
    } else {
      throw new BadRequestError('No files uploaded');
    }

    await IndexModel.updateIndexCreation(req.db, id, updateData);

    const record = await IndexModel.createUpload(req.db, {
      indexCreationId: id,
      imageData: req.files.image[0].buffer,
      imageMimeType: req.files.image[0].mimetype,
      imagePath: req.files.image[0].originalname,
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
    const data = await IndexModel.getUploadsByIndexId(req.db, id);
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

export const downloadImage = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await IndexModel.getIndexCreationById(req.db, id);

    if (!item || !item.imageData) {
      throw new NotFoundError('Image not found');
    }

    res.set('Content-Type', item.imageMimeType || 'image/jpeg');
    res.set('Content-Disposition', `inline; filename="index_${id}_image"`);
    res.send(item.imageData);
  } catch (err) {
    throw err;
  }
};

export const downloadUploadImage = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await IndexModel.getUploadById(req.db, id);

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

