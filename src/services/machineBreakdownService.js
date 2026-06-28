import * as Repository from "../repositories/machineBreakdownRepository.js";
import { BadRequestError, NotFoundError, ConflictError } from "../middlewares/customErrors.js";

export const getAllBreakdowns = async (db) => {
  return Repository.findAll(db);
};

export const getBreakdownById = async (db, id) => {
  const record = await Repository.findById(db, id);
  if (!record) {
    throw new NotFoundError(`Breakdown ticket with ID ${id} not found`);
  }
  return record;
};

export const getNextMwrNo = async (db) => {
  const maxVal = await Repository.findMaxMwrNo(db);
  return String(maxVal + 1);
};

export const createBreakdown = async (db, data) => {
  const { machineName, partNo, reportedBy, mwrNo } = data;

  if (!machineName || !machineName.trim()) {
    throw new BadRequestError("machineName is required");
  }
  if (!partNo || !partNo.trim()) {
    throw new BadRequestError("partNo is required");
  }
  if (!reportedBy || !reportedBy.trim()) {
    throw new BadRequestError("reportedBy is required");
  }

  let resolvedMwrNo = mwrNo && mwrNo.trim() ? mwrNo.trim() : null;
  if (!resolvedMwrNo) {
    resolvedMwrNo = await getNextMwrNo(db);
  }

  // Check if unique constraint is violated
  const existing = await Repository.findByMwrNo(db, resolvedMwrNo);
  if (existing) {
    throw new ConflictError(`Breakdown ticket with MWR No ${resolvedMwrNo} already exists`);
  }

  const payload = {
    mwrNo: resolvedMwrNo,
    machineName: machineName.trim(),
    jobCardNo: data.jobCardNo || null,
    partNo: partNo.trim(),
    processStage: data.processStage || null,
    location: data.location || null,
    date: data.date || new Date().toISOString(),
    reportedBy: reportedBy.trim(),
    priority: data.priority || "Standard",
    problemDescription: data.problemDescription || null,
    status: data.status || "waiting_clearance",
    createdBy: data.createdBy || "Admin",
    updatedBy: data.createdBy || "Admin",
  };

  return Repository.create(db, payload);
};

export const updateBreakdown = async (db, id, data) => {
  const existing = await Repository.findById(db, id);
  if (!existing) {
    throw new NotFoundError(`Breakdown ticket with ID ${id} not found`);
  }

  // Check for MWR No uniqueness if it is changing
  if (data.mwrNo && data.mwrNo.trim() !== existing.mwrNo) {
    const targetMwr = data.mwrNo.trim();
    const other = await Repository.findByMwrNo(db, targetMwr);
    if (other) {
      throw new ConflictError(`Breakdown ticket with MWR No ${targetMwr} already exists`);
    }
  }

  const payload = {
    mwrNo: data.mwrNo !== undefined ? data.mwrNo : undefined,
    machineName: data.machineName !== undefined ? data.machineName : undefined,
    jobCardNo: data.jobCardNo !== undefined ? data.jobCardNo : undefined,
    partNo: data.partNo !== undefined ? data.partNo : undefined,
    processStage: data.processStage !== undefined ? data.processStage : undefined,
    location: data.location !== undefined ? data.location : undefined,
    date: data.date !== undefined ? data.date : undefined,
    reportedBy: data.reportedBy !== undefined ? data.reportedBy : undefined,
    priority: data.priority !== undefined ? data.priority : undefined,
    problemDescription: data.problemDescription !== undefined ? data.problemDescription : undefined,
    status: data.status !== undefined ? data.status : undefined,
    actionTaken: data.actionTaken !== undefined ? data.actionTaken : undefined,
    remark: data.remark !== undefined ? data.remark : undefined,
    solvedBy: data.solvedBy !== undefined ? data.solvedBy : undefined,
    solvedDate: data.solvedDate !== undefined ? data.solvedDate : undefined,
    updatedBy: data.updatedBy || "Admin",
  };

  return Repository.update(db, id, payload);
};

export const deleteBreakdown = async (db, id) => {
  const existing = await Repository.findById(db, id);
  if (!existing) {
    throw new NotFoundError(`Breakdown ticket with ID ${id} not found`);
  }
  return Repository.remove(db, id);
};
