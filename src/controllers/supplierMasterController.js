import * as SupplierModel from '../models/supplierMasterModel.js';

export const getAll = async (req, res) => {
  try {
    const data = await SupplierModel.getAllSuppliers(req.db);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[supplierMaster] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getNextCode = async (req, res) => {
  try {
    const nextSCode = await SupplierModel.getNextSCode(req.db);
    res.json({ success: true, nextSCode });
  } catch (err) {
    console.error('[supplierMaster] getNextCode error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const {
      supplierType, sCode, supplierName, address, address2, address3, address4,
      city, country, state, stateCode, pinCode, contactPerson, mobile, phone,
      email, website, gstNo, panNo, bankName, branchName, accountName,
      accountNumber, ifscCode, micrCode, createdBy,
    } = req.body;

    if (!supplierName || !supplierName.trim()) {
      return res.status(400).json({ success: false, message: 'supplierName is required' });
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
      phone: phone || null,
      email: email || null,
      website: website || null,
      gstNo: gstNo || null,
      panNo: panNo || null,
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
      return res.status(409).json({ success: false, message: 'Supplier code already exists' });
    }
    console.error('[supplierMaster] create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      supplierType, sCode, supplierName, address, address2, address3, address4,
      city, country, state, stateCode, pinCode, contactPerson, mobile, phone,
      email, website, gstNo, panNo, bankName, branchName, accountName,
      accountNumber, ifscCode, micrCode, updatedBy,
    } = req.body;

    if (!supplierName || !supplierName.trim()) {
      return res.status(400).json({ success: false, message: 'supplierName is required' });
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
      phone: phone || null,
      email: email || null,
      website: website || null,
      gstNo: gstNo || null,
      panNo: panNo || null,
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
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Supplier code already exists' });
    }
    console.error('[supplierMaster] update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await SupplierModel.deleteSupplier(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    console.error('[supplierMaster] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
