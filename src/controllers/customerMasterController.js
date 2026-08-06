import * as CustomerModel from '../models/customerMasterModel.js';
import multer from 'multer';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middlewares/customErrors.js";


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

export const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await CustomerModel.getAllCustomers(req.db, page, limit);
    res.json({ success: true, ...result });
  } catch (err) {
    
    throw err;
  }
};

export const getNextCode = async (req, res) => {
  try {
    const nextCCode = await CustomerModel.getNextCCode(req.db);
    res.json({ success: true, nextCCode });
  } catch (err) {
    
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const {
      customerType, cCode, customerName, address, address2, address3, address4,
      city, country, state, stateCode, pinCode, contactPerson, mobile, mobileCode, phone, phoneCode,
      email, website, aadharNo, gstNo, panNo, bankName, branchName, accountName,
      accountNumber, ifscCode, micrCode, remarks, createdBy,
    } = req.body;

    if (!customerName || !customerName.trim()) {
      throw new BadRequestError('customerName is required');
    }

    let cleanEmail = email && email.trim() ? email.trim() : null;
    let cleanPan = panNo && panNo.trim() ? panNo.trim().toUpperCase() : null;
    let cleanGst = gstNo && gstNo.trim() ? gstNo.trim().toUpperCase() : null;
    let cleanAadhar = aadharNo ? aadharNo.replace(/\s|-/g, '') : null;

    if (cleanEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        throw new BadRequestError('Invalid email format');
      }
    }

    if (cleanPan) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(cleanPan)) {
        throw new BadRequestError('Invalid PAN format');
      }
    }

    if (cleanGst) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(cleanGst)) {
        throw new BadRequestError('Invalid GST format');
      }
      if (cleanPan) {
        const gstPan = cleanGst.slice(2, 12);
        if (gstPan !== cleanPan) {
          throw new BadRequestError('GST number does not match the entered PAN number');
        }
      }
    }

    if (cleanAadhar) {
      const aadharRegex = /^\d{12}$/;
      if (!aadharRegex.test(cleanAadhar)) {
        throw new BadRequestError('Invalid Aadhaar format');
      }
    }

    const resolvedCCode = cCode && cCode.trim()
      ? cCode.trim()
      : await CustomerModel.getNextCCode(req.db);

    const record = await CustomerModel.createCustomer(req.db, {
      customerType: customerType || '',
      cCode: resolvedCCode,
      customerName: customerName.trim(),
      address: address || null,
      address2: address2 || null,
      address3: address3 || null,
      address4: address4 || null,
      city: city || null,
      country: country || 'India',
      state: state || null,
      stateCode: stateCode || null,
      pinCode: pinCode || null,
      contactPerson: contactPerson || null,
      mobile: mobile || null,
      mobileCode: mobileCode || null,
      phone: phone || null,
      phoneCode: phoneCode || null,
      email: cleanEmail,
      website: website || null,
      aadharNo: cleanAadhar,
      gstNo: cleanGst,
      panNo: cleanPan,
      bankName: bankName || null,
      branchName: branchName || null,
      accountName: accountName || null,
      accountNumber: accountNumber || null,
      ifscCode: ifscCode || null,
      micrCode: micrCode || null,
      remarks: remarks || null,
      createdBy: createdBy || 'Admin',
      updatedBy: createdBy || 'Admin',
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ConflictError('Customer code already exists');
    }
    
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      customerType, cCode, customerName, address, address2, address3, address4,
      city, country, state, stateCode, pinCode, contactPerson, mobile, mobileCode, phone, phoneCode,
      email, website, aadharNo, gstNo, panNo, bankName, branchName, accountName,
      accountNumber, ifscCode, micrCode, remarks, updatedBy,
    } = req.body;

    if (!customerName || !customerName.trim()) {
      throw new BadRequestError('customerName is required');
    }

    let cleanEmail = email && email.trim() ? email.trim() : null;
    let cleanPan = panNo && panNo.trim() ? panNo.trim().toUpperCase() : null;
    let cleanGst = gstNo && gstNo.trim() ? gstNo.trim().toUpperCase() : null;
    let cleanAadhar = aadharNo ? aadharNo.replace(/\s|-/g, '') : null;

    if (cleanEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        throw new BadRequestError('Invalid email format');
      }
    }

    if (cleanPan) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(cleanPan)) {
        throw new BadRequestError('Invalid PAN format');
      }
    }

    if (cleanGst) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(cleanGst)) {
        throw new BadRequestError('Invalid GST format');
      }
      if (cleanPan) {
        const gstPan = cleanGst.slice(2, 12);
        if (gstPan !== cleanPan) {
          throw new BadRequestError('GST number does not match the entered PAN number');
        }
      }
    }

    if (cleanAadhar) {
      const aadharRegex = /^\d{12}$/;
      if (!aadharRegex.test(cleanAadhar)) {
        throw new BadRequestError('Invalid Aadhaar format');
      }
    }

    const record = await CustomerModel.updateCustomer(req.db, id, {
      customerType: customerType || '',
      cCode: cCode || undefined,
      customerName: customerName.trim(),
      address: address || null,
      address2: address2 || null,
      address3: address3 || null,
      address4: address4 || null,
      city: city || null,
      country: country || 'India',
      state: state || null,
      stateCode: stateCode || null,
      pinCode: pinCode || null,
      contactPerson: contactPerson || null,
      mobile: mobile || null,
      mobileCode: mobileCode || null,
      phone: phone || null,
      phoneCode: phoneCode || null,
      email: cleanEmail,
      website: website || null,
      aadharNo: cleanAadhar,
      gstNo: cleanGst,
      panNo: cleanPan,
      bankName: bankName || null,
      branchName: branchName || null,
      accountName: accountName || null,
      accountNumber: accountNumber || null,
      ifscCode: ifscCode || null,
      micrCode: micrCode || null,
      remarks: remarks || null,
      updatedBy: updatedBy || 'Admin',
    });

    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Customer not found');
    }
    if (err.code === 'P2002') {
      throw new ConflictError('Customer code already exists');
    }
    
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await CustomerModel.deleteCustomer(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Customer not found');
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

    const record = await CustomerModel.updateCustomer(req.db, id, updateData);
    res.json({ success: true, data: record });
  } catch (err) {
    
    throw err;
  }
};

export const downloadImage = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await CustomerModel.getCustomerById(req.db, id);
    
    if (!item || !item.imageData) {
      throw new NotFoundError('Image not found');
    }

    res.set('Content-Type', item.imageMimeType || 'image/jpeg');
    res.set('Content-Disposition', `inline; filename="customer_${id}_image"`);
    res.send(item.imageData);
  } catch (err) {
    
    throw err;
  }
};

export const downloadPdf = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await CustomerModel.getCustomerById(req.db, id);
    
    if (!item || !item.pdfData) {
      throw new NotFoundError('PDF not found');
    }

    res.set('Content-Type', item.pdfMimeType || 'application/pdf');
    res.set('Content-Disposition', `inline; filename="customer_${id}_document.pdf"`);
    res.send(item.pdfData);
  } catch (err) {
    
    throw err;
  }
};
