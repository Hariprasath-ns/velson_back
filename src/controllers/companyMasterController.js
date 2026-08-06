import { fileURLToPath } from 'url';
import path from 'path';
import multer from 'multer';
import * as CompanyModel from '../models/companyMasterModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middlewares/customErrors.js";


const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, /^image\/(jpeg|png|gif|webp)$/.test(file.mimetype));
  },
});

const buildData = (body) => ({
  companyCode:       body.companyCode?.trim() || undefined,
  companyName:       body.companyName?.trim() || '',
  companyType:       body.companyType || null,
  doorNumber:        body.doorNumber || null,
  street:            body.street || null,
  place:             body.place || null,
  post:              body.post || null,
  city:              body.city || null,
  taluk:             body.taluk || null,
  district:          body.district || null,
  districtCode:      body.districtCode || null,
  state:             body.state || null,
  stateCode:         body.stateCode || null,
  country:           body.country || 'India',
  pinCode:           body.pinCode || null,
  address:           body.address || null,
  gstin:             body.gstin || null,
  panNo:             body.panNo || null,
  companyPhone:      body.companyPhone || null,
  companyEmail:      body.companyEmail || null,
  companyWebsite:    body.companyWebsite || null,
  marketingPhone:    body.marketingPhone || null,
  marketingEmail:    body.marketingEmail || null,
  marketingWebsite:  body.marketingWebsite || null,
  purchasePhone:     body.purchasePhone || null,
  purchaseEmail:     body.purchaseEmail || null,
  purchaseWebsite:   body.purchaseWebsite || null,
  salesPhone:        body.salesPhone || null,
  salesEmail:        body.salesEmail || null,
  salesWebsite:      body.salesWebsite || null,
  servicePhone:      body.servicePhone || null,
  serviceEmail:      body.serviceEmail || null,
  serviceWebsite:    body.serviceWebsite || null,
  bankName:          body.bankName || null,
  bankBranch:        body.bankBranch || null,
  bankAccountType:   body.bankAccountType || null,
  bankAccountName:   body.bankAccountName || null,
  bankAccountNumber: body.bankAccountNumber || null,
  bankIfscCode:      body.bankIfscCode || null,
  bankMicrCode:      body.bankMicrCode || null,
  bankDistrict:      body.bankDistrict || null,
  bankState:         body.bankState || null,
  bankPinCode:       body.bankPinCode || null,
  bankCountry:       body.bankCountry || null,
  bankAddress:       body.bankAddress || null,
});

export const getAll = async (req, res) => {
  try {
    const data = await CompanyModel.getAllCompanies(req.db);
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const getNextCode = async (req, res) => {
  try {
    const nextCode = await CompanyModel.getNextCompanyCode(req.db);
    res.json({ success: true, nextCode });
  } catch (err) {
    
    throw err;
  }
};

export const getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const record = await CompanyModel.getCompanyById(req.db, id);
    if (!record) throw new NotFoundError('Company not found');
    res.json({ success: true, data: record });
  } catch (err) {
    
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    if (!req.body.companyName?.trim()) {
      throw new BadRequestError('companyName is required');
    }

    const resolvedCode = req.body.companyCode?.trim()
      ? req.body.companyCode.trim()
      : await CompanyModel.getNextCompanyCode(req.db);

    const data = buildData(req.body);
    data.companyCode = resolvedCode;
    data.createdBy = req.body.createdBy || 'Admin';
    data.updatedBy = req.body.createdBy || 'Admin';
    
    if (req.file) {
      data.logoData = req.file.buffer;
      data.logoMimeType = req.file.mimetype;
    }

    const record = await CompanyModel.createCompany(req.db, data);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ConflictError('Company code already exists');
    }
    
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!req.body.companyName?.trim()) {
      throw new BadRequestError('companyName is required');
    }

    const data = buildData(req.body);
    data.updatedBy = req.body.updatedBy || 'Admin';
    if (req.file) {
      data.logoData = req.file.buffer;
      data.logoMimeType = req.file.mimetype;
    }

    const record = await CompanyModel.updateCompany(req.db, id, data);
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Company not found');
    }
    if (err.code === 'P2002') {
      throw new ConflictError('Company code already exists');
    }
    
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await CompanyModel.deleteCompany(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Company not found');
    }
    
    throw err;
  }
};

export const downloadLogo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const company = await CompanyModel.getCompanyById(req.db, id);
    
    if (!company || !company.logoData) {
      throw new NotFoundError('Logo not found');
    }

    res.set('Content-Type', company.logoMimeType || 'image/png');
    res.set('Content-Disposition', `inline; filename="company_${id}_logo"`);
    res.send(company.logoData);
  } catch (err) {
    
    throw err;
  }
};
