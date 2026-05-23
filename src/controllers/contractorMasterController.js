import * as ContractorModel from '../models/contractorMasterModel.js';

export const getAll = async (req, res) => {
  try {
    const data = await ContractorModel.getAllContractors(req.db);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[contractorMaster] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getNextCode = async (req, res) => {
  try {
    const nextCode = await ContractorModel.getNextContractCode(req.db);
    res.json({ success: true, nextCode });
  } catch (err) {
    console.error('[contractorMaster] getNextCode error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { contractCode, contractName, address, phone, email, status, createdBy } = req.body;

    if (!contractName || !contractName.trim()) {
      return res.status(400).json({ success: false, message: 'contractName is required' });
    }

    const resolvedCode = contractCode && contractCode.trim()
      ? contractCode.trim()
      : await ContractorModel.getNextContractCode(req.db);

    const record = await ContractorModel.createContractor(req.db, {
      contractCode: resolvedCode,
      contractName: contractName.trim(),
      address: address || null,
      phone: phone || null,
      email: email || null,
      status: status || 'Active',
      createdBy: createdBy || 'Admin',
      updatedBy: createdBy || 'Admin',
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Contractor code already exists' });
    }
    console.error('[contractorMaster] create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { contractName, address, phone, email, status, updatedBy } = req.body;

    if (!contractName || !contractName.trim()) {
      return res.status(400).json({ success: false, message: 'contractName is required' });
    }

    const record = await ContractorModel.updateContractor(req.db, id, {
      contractName: contractName.trim(),
      address: address || null,
      phone: phone || null,
      email: email || null,
      status: status || 'Active',
      updatedBy: updatedBy || 'Admin',
    });

    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Contractor not found' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await ContractorModel.deleteContractor(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Contractor not found' });
    }
    console.error('[contractorMaster] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
