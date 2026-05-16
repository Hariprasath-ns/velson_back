import * as TaxLedgerModel from "../models/taxLedgerModel.js";

export const getAll = async (req, res) => {
  try {
    const data = await TaxLedgerModel.getAllTaxLedgers(req.db);
    res.json({ success: true, data });
  } catch (err) {
    console.error("[taxLedger] getAll error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await TaxLedgerModel.getTaxLedgerById(req.db, id);
    if (!data) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const ledgerName = String(req.body.ledgerName || "").trim();
    const taxPercent = parseFloat(req.body.taxPercent || 0);

    if (!ledgerName)
      return res.status(400).json({ success: false, message: "ledgerName is required" });
    if (isNaN(taxPercent))
      return res.status(400).json({ success: false, message: "taxPercent must be a number" });

    const exists = await TaxLedgerModel.checkLedgerNameExists(req.db, ledgerName);
    if (exists)
      return res.status(409).json({ success: false, message: "ledgerName already exists" });

    const data = await TaxLedgerModel.createTaxLedger(req.db, { ledgerName, taxPercent });
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error("[taxLedger] create error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ledgerName = String(req.body.ledgerName || "").trim();
    const taxPercent = parseFloat(req.body.taxPercent || 0);

    if (!ledgerName)
      return res.status(400).json({ success: false, message: "ledgerName is required" });
    if (isNaN(taxPercent))
      return res.status(400).json({ success: false, message: "taxPercent must be a number" });

    const exists = await TaxLedgerModel.checkLedgerNameExists(req.db, ledgerName, id);
    if (exists)
      return res.status(409).json({ success: false, message: "ledgerName already exists" });

    const data = await TaxLedgerModel.updateTaxLedger(req.db, id, { ledgerName, taxPercent });
    res.json({ success: true, data });
  } catch (err) {
    if (err.code === "P2025")
      return res.status(404).json({ success: false, message: "Record not found" });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await TaxLedgerModel.deleteTaxLedger(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === "P2025")
      return res.status(404).json({ success: false, message: "Record not found" });
    res.status(500).json({ success: false, message: err.message });
  }
};
