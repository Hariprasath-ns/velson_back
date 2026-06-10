import * as Service from "../services/machineBreakdownService.js";
import { BadRequestError } from "../middelwares/customErrors.js";

export const getAll = async (req, res) => {
  try {
    const data = await Service.getAllBreakdowns(req.db);
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

export const getNextMwr = async (req, res) => {
  try {
    const nextMwr = await Service.getNextMwrNo(req.db);
    res.json({ success: true, nextMwr });
  } catch (err) {
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const user = req.user?.username || req.user?.email || "Admin";
    const data = {
      ...req.body,
      createdBy: user,
      updatedBy: user,
    };
    const record = await Service.createBreakdown(req.db, data);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new BadRequestError("Invalid ticket ID format");
    }

    const user = req.user?.username || req.user?.email || "Admin";
    const data = {
      ...req.body,
      updatedBy: user,
    };

    const record = await Service.updateBreakdown(req.db, id, data);
    res.json({ success: true, data: record });
  } catch (err) {
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new BadRequestError("Invalid ticket ID format");
    }

    await Service.deleteBreakdown(req.db, id);
    res.json({ success: true });
  } catch (err) {
    throw err;
  }
};
