import * as Repository from "../repositories/contractorMasterRepository.js";
import { BadRequestError, NotFoundError, ConflictError } from "../middlewares/customErrors.js";

/**
 * Get all contractors.
 * 
 * @param {import('@prisma/client').PrismaClient} db
 * @returns {Promise<Array>}
 */
export const getAllContractors = async (db) => {
  return Repository.findAll(db);
};

/**
 * Get contractor by primary key ID.
 * 
 * @param {import('@prisma/client').PrismaClient} db
 * @param {number} id
 * @returns {Promise<Object>}
 */
export const getContractorById = async (db, id) => {
  const record = await Repository.findById(db, id);
  if (!record) {
    throw new NotFoundError("Contractor not found");
  }
  return record;
};

/**
 * Generate the next sequential contract code.
 * 
 * @param {import('@prisma/client').PrismaClient} db
 * @returns {Promise<string>}
 */
export const getNextContractCode = async (db) => {
  const maxNum = await Repository.findMaxContractCode(db);
  return 'CONTRACTOR' + String(maxNum + 1).padStart(3, '0');
};

/**
 * Create a new contractor.
 * 
 * @param {import('@prisma/client').PrismaClient} db
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export const createContractor = async (db, data) => {
  const { contractCode, contractName, address, phone, email, status, createdBy } = data;

  if (!contractName || !contractName.trim()) {
    throw new BadRequestError("contractName is required");
  }

  let resolvedCode = contractCode && contractCode.trim() ? contractCode.trim() : null;
  if (!resolvedCode) {
    resolvedCode = await getNextContractCode(db);
  }

  // Check unique contractCode constraint before database call
  const existing = await Repository.findByContractCode(db, resolvedCode);
  if (existing) {
    throw new ConflictError("Contractor code already exists");
  }

  const payload = {
    contractCode: resolvedCode,
    contractName: contractName.trim(),
    address: address || null,
    phone: phone || null,
    email: email || null,
    status: status || 'Active',
    createdBy: createdBy || 'Admin',
    updatedBy: createdBy || 'Admin',
  };

  return Repository.create(db, payload);
};

/**
 * Update an existing contractor.
 * 
 * @param {import('@prisma/client').PrismaClient} db
 * @param {number} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export const updateContractor = async (db, id, data) => {
  const existing = await Repository.findById(db, id);
  if (!existing) {
    throw new NotFoundError("Contractor not found");
  }

  const { contractName, address, phone, email, status, updatedBy } = data;

  if (!contractName || !contractName.trim()) {
    throw new BadRequestError("contractName is required");
  }

  const payload = {
    contractName: contractName.trim(),
    address: address || null,
    phone: phone || null,
    email: email || null,
    status: status || 'Active',
    updatedBy: updatedBy || 'Admin',
  };

  return Repository.update(db, id, payload);
};

/**
 * Delete a contractor.
 * 
 * @param {import('@prisma/client').PrismaClient} db
 * @param {number} id
 * @returns {Promise<Object>}
 */
export const deleteContractor = async (db, id) => {
  const existing = await Repository.findById(db, id);
  if (!existing) {
    throw new NotFoundError("Contractor not found");
  }
  return Repository.remove(db, id);
};
