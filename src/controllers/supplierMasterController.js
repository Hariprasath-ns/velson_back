import * as SupplierModel from '../models/supplierMasterModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middlewares/customErrors.js";


export const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await SupplierModel.getAllSuppliers(req.db, page, limit);
    res.json({ success: true, ...result });
  } catch (err) {
    
    throw err;
  }
};

export const getNextCode = async (req, res) => {
  try {
    const nextSCode = await SupplierModel.getNextSCode(req.db);
    res.json({ success: true, nextSCode });
  } catch (err) {
    
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const {
      supplierType, sCode, supplierName, address, address2, address3, address4,
      city, country, state, stateCode, pinCode, contactPerson, mobile, mobileCode, phone, phoneCode,
      email, website, gstNo, panNo, bankName, branchName, accountName,
      accountNumber, ifscCode, micrCode, createdBy,
    } = req.body;

    if (!supplierName || !supplierName.trim()) {
      throw new BadRequestError('supplierName is required');
    }

    let cleanEmail = email && email.trim() ? email.trim() : null;
    let cleanPan = panNo && panNo.trim() ? panNo.trim().toUpperCase() : null;
    let cleanGst = gstNo && gstNo.trim() ? gstNo.trim().toUpperCase() : null;

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

    const resolvedSCode = sCode && sCode.trim()
      ? sCode.trim()
      : await SupplierModel.getNextSCode(req.db);

    const record = await SupplierModel.createSupplier(req.db, {
      supplierType: supplierType || '',
      sCode: resolvedSCode,
      supplierName: supplierName.trim(),
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
      gstNo: cleanGst,
      panNo: cleanPan,
      bankName: bankName || null,
      branchName: branchName || null,
      accountName: accountName || null,
      accountNumber: accountNumber || null,
      ifscCode: ifscCode || null,
      micrCode: micrCode || null,
      createdBy: createdBy || 'Admin',
      updatedBy: createdBy || 'Admin',
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ConflictError('Supplier code already exists');
    }
    
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      supplierType, sCode, supplierName, address, address2, address3, address4,
      city, country, state, stateCode, pinCode, contactPerson, mobile, mobileCode, phone, phoneCode,
      email, website, gstNo, panNo, bankName, branchName, accountName,
      accountNumber, ifscCode, micrCode, updatedBy,
    } = req.body;

    if (!supplierName || !supplierName.trim()) {
      throw new BadRequestError('supplierName is required');
    }

    let cleanEmail = email && email.trim() ? email.trim() : null;
    let cleanPan = panNo && panNo.trim() ? panNo.trim().toUpperCase() : null;
    let cleanGst = gstNo && gstNo.trim() ? gstNo.trim().toUpperCase() : null;

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

    const record = await SupplierModel.updateSupplier(req.db, id, {
      supplierType: supplierType || '',
      sCode: sCode || undefined,
      supplierName: supplierName.trim(),
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
      gstNo: cleanGst,
      panNo: cleanPan,
      bankName: bankName || null,
      branchName: branchName || null,
      accountName: accountName || null,
      accountNumber: accountNumber || null,
      ifscCode: ifscCode || null,
      micrCode: micrCode || null,
      updatedBy: updatedBy || 'Admin',
    });

    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Supplier not found');
    }
    if (err.code === 'P2002') {
      throw new ConflictError('Supplier code already exists');
    }
    
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await SupplierModel.deleteSupplier(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Supplier not found');
    }
    
    throw err;
  }
};
