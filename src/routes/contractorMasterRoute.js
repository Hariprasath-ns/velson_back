import express from 'express';
import Joi from 'joi';
import { dbSelect } from '../middlewares/dbSelect.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { getAll, getNextCode, create, update, remove } from '../controllers/contractorMasterController.js';

const router = express.Router();


// Validation schemas
const createContractorSchema = Joi.object({
  body: Joi.object({
    contractCode: Joi.string().allow('', null).max(100).optional(),
    contractName: Joi.string().trim().required().messages({
      'any.required': 'contractName is required',
      'string.empty': 'contractName cannot be empty',
    }),
    address: Joi.string().allow('', null).optional(),
    phone: Joi.string().allow('', null).max(20).optional(),
    email: Joi.string().email().allow('', null).max(100).optional().messages({
      'string.email': 'Invalid email format',
    }),
    status: Joi.string().valid('Active', 'Inactive').optional(),
    createdBy: Joi.string().allow('', null).optional(),
    updatedBy: Joi.string().allow('', null).optional(),
  }).unknown(true),
  query: Joi.object().unknown(true),
  params: Joi.object().unknown(true),
});

const updateContractorSchema = Joi.object({
  body: Joi.object({
    contractName: Joi.string().trim().required().messages({
      'any.required': 'contractName is required',
      'string.empty': 'contractName cannot be empty',
    }),
    address: Joi.string().allow('', null).optional(),
    phone: Joi.string().allow('', null).max(20).optional(),
    email: Joi.string().email().allow('', null).max(100).optional().messages({
      'string.email': 'Invalid email format',
    }),
    status: Joi.string().valid('Active', 'Inactive').optional(),
    updatedBy: Joi.string().allow('', null).optional(),
  }).unknown(true),
  query: Joi.object().unknown(true),
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }).unknown(true),
});

const deleteContractorSchema = Joi.object({
  body: Joi.object().unknown(true),
  query: Joi.object().unknown(true),
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
  }).unknown(true),
});

// Routes definition
router.get('/contractor-master', getAll);
router.get('/contractor-master/next-code', getNextCode);
router.post('/contractor-master', validateRequest(createContractorSchema), create);
router.put('/contractor-master/:id', validateRequest(updateContractorSchema), update);
router.delete('/contractor-master/:id', validateRequest(deleteContractorSchema), remove);

export default router;

