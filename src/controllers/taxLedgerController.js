import * as TaxLedgerModel from "../models/taxLedgerModel.js";
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middlewares/customErrors.js";


export const getAll = async (req, res) => {
  try {
    const data = await TaxLedgerModel.getAllTaxLedgers(req.db);
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const getOne = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await TaxLedgerModel.getTaxLedgerById(req.db, id);
    if (!data) throw new NotFoundError("Not found");
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const ledgerName = String(req.body.ledgerName || "").trim();
    const taxPercent = parseFloat(req.body.taxPercent || 0);

    if (!ledgerName)
      throw new BadRequestError("ledgerName is required");
    if (isNaN(taxPercent))
      throw new BadRequestError("taxPercent must be a number");

    const exists = await TaxLedgerModel.checkLedgerNameExists(req.db, ledgerName);
    if (exists)
      throw new ConflictError("ledgerName already exists");

    const data = await TaxLedgerModel.createTaxLedger(req.db, { ledgerName, taxPercent });
    res.status(201).json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ledgerName = String(req.body.ledgerName || "").trim();
    const taxPercent = parseFloat(req.body.taxPercent || 0);

    if (!ledgerName)
      throw new BadRequestError("ledgerName is required");
    if (isNaN(taxPercent))
      throw new BadRequestError("taxPercent must be a number");

    const exists = await TaxLedgerModel.checkLedgerNameExists(req.db, ledgerName, id);
    if (exists)
      throw new ConflictError("ledgerName already exists");

    const data = await TaxLedgerModel.updateTaxLedger(req.db, id, { ledgerName, taxPercent });
    res.json({ success: true, data });
  } catch (err) {
    if (err.code === "P2025")
      throw new NotFoundError("Record not found");
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await TaxLedgerModel.deleteTaxLedger(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === "P2025")
      throw new NotFoundError("Record not found");
    throw err;
  }
};
