import * as ReferenceTypeModel from "../models/referenceTypeModel.js";

export const getValuesByName = async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name);
    const values = await ReferenceTypeModel.getValuesByTypeName(req.db, name);
    res.json({ success: true, data: values });
  } catch (err) {
    console.error("[referenceType] getValuesByName error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllTypes = async (req, res) => {
  try {
    const data = await ReferenceTypeModel.getAllReferenceTypes(req.db);
    res.json({ success: true, data });
  } catch (err) {
    console.error("[referenceType] getAllTypes error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getTypeById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const record = await ReferenceTypeModel.getReferenceTypeById(req.db, id);
    if (!record) return res.status(404).json({ error: "Reference type not found" });
    res.json({ success: true, data: record });
  } catch (err) {
    console.error("[referenceType] getTypeById error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const createType = async (req, res) => {
  try {
    const { name, createdBy } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "name is required" });
    }
    const trimmedName = name.trim();
    const code = await ReferenceTypeModel.getNextReferenceTypeCode(req.db);
    const record = await ReferenceTypeModel.createReferenceType(req.db, {
      code,
      name: trimmedName,
      createdBy: createdBy || null,
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error("[referenceType] createType error:", err);
    if (err.code === "P2002") {
      const field = err.meta?.target?.includes("name") ? "name" : "code";
      return res.status(409).json({ error: `A reference type with this ${field} already exists` });
    }
    res.status(500).json({ error: err.message });
  }
};

export const updateType = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, createdBy } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "name is required" });
    }
    const record = await ReferenceTypeModel.updateReferenceType(req.db, id, {
      name: name.trim(),
      ...(createdBy !== undefined && { createdBy }),
    });
    res.json({ success: true, data: record });
  } catch (err) {
    console.error("[referenceType] updateType error:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Reference type not found" });
    }
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A reference type with this name already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

export const deleteType = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await ReferenceTypeModel.deleteReferenceType(req.db, id);
    res.json({ success: true });
  } catch (err) {
    console.error("[referenceType] deleteType error:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Reference type not found" });
    }
    res.status(500).json({ error: err.message });
  }
};
