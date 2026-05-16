import * as TaxMasterModel from "../models/taxMasterModel.js";

export const getAll = async (req, res) => {
  try {
    const data = await TaxMasterModel.getAllTaxMasters(req.db);
    res.json({ success: true, data });
  } catch (err) {
    console.error("[taxMaster] getAll error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await TaxMasterModel.getTaxMasterById(req.db, id);
    if (!data) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const {
      taxLedgerId,
      taxPercent,
      cgstTax,
      sgstTax,
      igstTax,
      purchaseCgstTax,
      purchaseSgstTax,
      purchaseIgstTax,
      salesCgstTax,
      salesSgstTax,
      salesIgstTax,
    } = req.body;

    if (!taxLedgerId)
      return res.status(400).json({ success: false, message: "taxLedgerId is required" });

    const data = await TaxMasterModel.createTaxMaster(req.db, {
      taxLedgerId:     Number(taxLedgerId),
      taxPercent:      parseFloat(taxPercent      || 0),
      cgstTax:         parseFloat(cgstTax         || 0),
      sgstTax:         parseFloat(sgstTax         || 0),
      igstTax:         parseFloat(igstTax         || 0),
      purchaseCgstTax: parseFloat(purchaseCgstTax || 0),
      purchaseSgstTax: parseFloat(purchaseSgstTax || 0),
      purchaseIgstTax: parseFloat(purchaseIgstTax || 0),
      salesCgstTax:    parseFloat(salesCgstTax    || 0),
      salesSgstTax:    parseFloat(salesSgstTax    || 0),
      salesIgstTax:    parseFloat(salesIgstTax    || 0),
    });

    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error("[taxMaster] create error:", err);
    if (err.code === "P2003")
      return res.status(400).json({ success: false, message: "Invalid taxLedgerId" });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      taxLedgerId,
      taxPercent,
      cgstTax,
      sgstTax,
      igstTax,
      purchaseCgstTax,
      purchaseSgstTax,
      purchaseIgstTax,
      salesCgstTax,
      salesSgstTax,
      salesIgstTax,
    } = req.body;

    if (!taxLedgerId)
      return res.status(400).json({ success: false, message: "taxLedgerId is required" });

    const data = await TaxMasterModel.updateTaxMaster(req.db, id, {
      taxLedgerId:     Number(taxLedgerId),
      taxPercent:      parseFloat(taxPercent      || 0),
      cgstTax:         parseFloat(cgstTax         || 0),
      sgstTax:         parseFloat(sgstTax         || 0),
      igstTax:         parseFloat(igstTax         || 0),
      purchaseCgstTax: parseFloat(purchaseCgstTax || 0),
      purchaseSgstTax: parseFloat(purchaseSgstTax || 0),
      purchaseIgstTax: parseFloat(purchaseIgstTax || 0),
      salesCgstTax:    parseFloat(salesCgstTax    || 0),
      salesSgstTax:    parseFloat(salesSgstTax    || 0),
      salesIgstTax:    parseFloat(salesIgstTax    || 0),
    });

    res.json({ success: true, data });
  } catch (err) {
    if (err.code === "P2025")
      return res.status(404).json({ success: false, message: "Record not found" });
    if (err.code === "P2003")
      return res.status(400).json({ success: false, message: "Invalid taxLedgerId" });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await TaxMasterModel.deleteTaxMaster(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === "P2025")
      return res.status(404).json({ success: false, message: "Record not found" });
    res.status(500).json({ success: false, message: err.message });
  }
};
