import express from 'express';
import Joi from 'joi';
import { dbSelect } from '../middlewares/dbSelect.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { getNextNo, create, getRecentValues, getAll, update, remove, getById } from '../controllers/deliveryChallanController.js';

const router = express.Router();

// Validation schemas
const createDcSchema = Joi.object({
  body: Joi.object({
    dcNo: Joi.string().trim().required().messages({
      'any.required': 'dcNo is required',
      'string.empty': 'dcNo cannot be empty',
    }),
    financialYear: Joi.string().allow('', null).optional(),
    date: Joi.string().allow('', null).optional(),
    partyType: Joi.string().valid('Customer', 'Supplier').required().messages({
      'any.required': 'partyType is required',
      'any.only': 'partyType must be either Customer or Supplier',
    }),
    customerId: Joi.number().integer().positive().allow(null).optional(),
    supplierId: Joi.number().integer().positive().allow(null).optional(),
    partyName: Joi.string().trim().optional(),
    customerName: Joi.string().trim().optional(),
    address: Joi.string().allow('', null).optional(),
    contPerson: Joi.string().allow('', null).optional(),
    contactNo: Joi.string().allow('', null).optional(),
    gstNo: Joi.string().allow('', null).optional(),
    dcType: Joi.string().trim().required().messages({
      'any.required': 'dcType is required',
      'string.empty': 'dcType cannot be empty',
    }),
    vehicleNo: Joi.string().allow('', null).optional(),
    driverName: Joi.string().allow('', null).optional(),
    desThrough: Joi.string().allow('', null).optional(),
    termsOfDelivery: Joi.string().allow('', null).optional(),
    createdBy: Joi.string().allow('', null).optional(),
    items: Joi.array().items(
      Joi.object({
        slNo: Joi.number().integer().positive().optional(),
        barcode: Joi.string().allow('', null).optional(),
        partNo: Joi.string().trim().required().messages({
          'any.required': 'partNo is required',
          'string.empty': 'partNo cannot be empty',
        }),
        partName: Joi.string().trim().required().messages({
          'any.required': 'partName is required',
          'string.empty': 'partName cannot be empty',
        }),
        spec: Joi.string().allow('', null).optional(),
        brand: Joi.string().allow('', null).optional(),
        qty: Joi.number().positive().required().messages({
          'any.required': 'qty is required',
          'number.positive': 'qty must be positive',
        }),
        uom: Joi.string().allow('', null).optional(),
        rate: Joi.number().min(0).optional(),
        amount: Joi.number().min(0).optional(),
        source: Joi.string().allow('', null).optional(),
        sourceId: Joi.number().integer().positive().allow(null).optional(),
        heatTreatment: Joi.alternatives().try(Joi.string(), Joi.number()).allow('', null).optional(),
        mGrade: Joi.alternatives().try(Joi.string(), Joi.number()).allow('', null).optional(),
        rework: Joi.alternatives().try(Joi.string(), Joi.number()).allow('', null).optional(),
        hrc: Joi.alternatives().try(Joi.string(), Joi.number()).allow('', null).optional(),
        weight: Joi.alternatives().try(Joi.string(), Joi.number()).allow('', null).optional(),
        details: Joi.alternatives().try(Joi.string(), Joi.number()).allow('', null).optional(),
        workType: Joi.alternatives().try(Joi.string(), Joi.number()).allow('', null).optional(),
      }).unknown(true)
    ).min(1).required().messages({
      'any.required': 'items list is required',
      'array.min': 'At least one item must be added',
    }),
  }).unknown(true),
  query: Joi.object().unknown(true),
  params: Joi.object().unknown(true),
});

// Routes definition
router.get('/delivery-challan/next-number', getNextNo);
router.get('/delivery-challan/recent-values', getRecentValues);
router.get('/delivery-challan/:id', getById);
router.get('/delivery-challan', getAll);
router.post('/delivery-challan', validateRequest(createDcSchema), create);
router.put('/delivery-challan/:id', validateRequest(createDcSchema), update);
router.delete('/delivery-challan/:id', remove);

export default router;
