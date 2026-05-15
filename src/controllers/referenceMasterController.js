import * as ReferenceMasterModel from "../models/referenceMasterModel.js";

export const getRecordsByType = async (req, res) => {
  try {
    const type = decodeURIComponent(req.params.type);
    const records = await ReferenceMasterModel.getReferenceMastersByType(req.db, type);
    const nextCode = await ReferenceMasterModel.getNextCodeForType(req.db, type);
    
    res.json({
      success: true,
      nextCode,
      data: records
    });
  } catch (err) {
    console.error("[referenceMaster] getRecordsByType error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const createRecord = async (req, res) => {
  try {
    const { referenceType, code, description, updatedBy } = req.body;
    if (!referenceType || !code || !description) {
      return res.status(400).json({ error: "referenceType, code, and description are required" });
    }
    const record = await ReferenceMasterModel.createReferenceMaster(req.db, { 
      referenceType, 
      code, 
      description, 
      updatedBy: updatedBy || "Admin" 
    });
    
    // Also return the next code and updated records for convenience if needed, 
    // or frontend can refetch.
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateRecord = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { referenceType, code, description, updatedBy } = req.body;
    const record = await ReferenceMasterModel.updateReferenceMaster(req.db, id, { 
      referenceType, 
      code, 
      description, 
      updatedBy: updatedBy || "Admin" 
    });
    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Record not found" });
    }
    res.status(500).json({ error: err.message });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await ReferenceMasterModel.deleteReferenceMaster(req.db, id);
    res.status(200).json({ success: true });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Record not found" });
    }
    res.status(500).json({ error: err.message });
  }
};
