import * as CustomerModel from '../models/customerMasterModel.js';

export const getAll = async (req, res) => {
  try {
    const data = await CustomerModel.getAllCustomers(req.db);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[customerMaster] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getNextCode = async (req, res) => {
  try {
    const nextCCode = await CustomerModel.getNextCCode(req.db);
    res.json({ success: true, nextCCode });
  } catch (err) {
    console.error('[customerMaster] getNextCode error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const {
      customerType, cCode, customerName, address, address2, address3, address4,
      city, country, state, stateCode, pinCode, contactPerson, mobile, phone,
      email, website, aadharNo, gstNo, panNo, bankName, branchName, accountName,
      accountNumber, ifscCode, micrCode, remarks, createdBy,
    } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, message: 'customerName is required' });
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
      phone: phone || null,
      email: email || null,
      website: website || null,
      aadharNo: aadharNo || null,
      gstNo: gstNo || null,
      panNo: panNo || null,
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
      return res.status(409).json({ success: false, message: 'Customer code already exists' });
    }
    console.error('[customerMaster] create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      customerType, cCode, customerName, address, address2, address3, address4,
      city, country, state, stateCode, pinCode, contactPerson, mobile, phone,
      email, website, aadharNo, gstNo, panNo, bankName, branchName, accountName,
      accountNumber, ifscCode, micrCode, remarks, updatedBy,
    } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, message: 'customerName is required' });
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
      phone: phone || null,
      email: email || null,
      website: website || null,
      aadharNo: aadharNo || null,
      gstNo: gstNo || null,
      panNo: panNo || null,
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
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Customer code already exists' });
    }
    console.error('[customerMaster] update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await CustomerModel.deleteCustomer(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    console.error('[customerMaster] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
