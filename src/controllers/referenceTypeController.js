import * as ReferenceTypeModel from "../models/referenceTypeModel.js";
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middelwares/customErrors.js";


export const getValuesByName = async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name);
    const values = await ReferenceTypeModel.getValuesByTypeName(req.db, name);
    res.json({ success: true, data: values });
  } catch (err) {
    
    throw err;
  }
};

export const getAllTypes = async (req, res) => {
  try {
    const data = await ReferenceTypeModel.getAllReferenceTypes(req.db);
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const getTypeById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const record = await ReferenceTypeModel.getReferenceTypeById(req.db, id);
    if (!record) throw new NotFoundError("Reference type not found");
    res.json({ success: true, data: record });
  } catch (err) {
    
    throw err;
  }
};

export const createType = async (req, res) => {
  try {
    const { name, createdBy } = req.body;
    if (!name || !name.trim()) {
      throw new BadRequestError("name is required");
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
    
    if (err.code === "P2002") {
      const field = err.meta?.target?.includes("name") ? "name" : "code";
      throw new ConflictError(`A reference type with this ${field} already exists`);
    }
    throw err;
  }
};

export const updateType = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, createdBy } = req.body;
    if (!name || !name.trim()) {
      throw new BadRequestError("name is required");
    }
    const record = await ReferenceTypeModel.updateReferenceType(req.db, id, {
      name: name.trim(),
      ...(createdBy !== undefined && { createdBy }),
    });
    res.json({ success: true, data: record });
  } catch (err) {
    
    if (err.code === "P2025") {
      throw new NotFoundError("Reference type not found");
    }
    if (err.code === "P2002") {
      throw new ConflictError("A reference type with this name already exists");
    }
    throw err;
  }
};

export const deleteType = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await ReferenceTypeModel.deleteReferenceType(req.db, id);
    res.json({ success: true });
  } catch (err) {
    
    if (err.code === "P2025") {
      throw new NotFoundError("Reference type not found");
    }
    throw err;
  }
};
