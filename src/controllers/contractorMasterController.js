import * as ContractorService from '../services/contractorMasterService.js';

export const getAll = async (req, res) => {
  try {
    const data = await ContractorService.getAllContractors(req.db);
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

export const getNextCode = async (req, res) => {
  try {
    const nextCode = await ContractorService.getNextContractCode(req.db);
    res.json({ success: true, nextCode });
  } catch (err) {
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const record = await ContractorService.createContractor(req.db, req.body);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const record = await ContractorService.updateContractor(req.db, id, req.body);
    res.json({ success: true, data: record });
  } catch (err) {
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await ContractorService.deleteContractor(req.db, id);
    res.json({ success: true });
  } catch (err) {
    throw err;
  }
};
