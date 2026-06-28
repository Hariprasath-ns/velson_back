import express from 'express';
import Joi from 'joi';
import { dbSelect } from '../middlewares/dbSelect.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { getNextNo, create, update, getAll, getById, remove } from '../controllers/creditSalesController.js';

const router = express.Router();

// Validation schemas
const creditSaleSchema = Joi.object({
  body: Joi.object({
    billNo: Joi.string().trim().required().messages({
      'any.required': 'billNo is required',
      'string.empty': 'billNo cannot be empty'
    }),
    billDate: Joi.string().allow('', null).optional(),
    salesAc: Joi.string().trim().allow('', null).optional(),
    mode: Joi.string().trim().allow('', null).optional(),
    dcNo: Joi.string().trim().allow('', null).optional(),
    dcDate: Joi.string().allow('', null).optional(),
    partyName: Joi.string().trim().required().messages({
      'any.required': 'partyName is required',
      'string.empty': 'partyName cannot be empty'
    }),
    address: Joi.string().allow('', null).optional(),
    taxType: Joi.string().valid('Local', 'Inter').required().messages({
      'any.required': 'taxType is required'
    }),
    deliveryPlace: Joi.string().allow('', null).optional(),
    deliveryTo: Joi.string().allow('', null).optional(),
    stockReduce: Joi.string().valid('No', 'Yes').optional(),
    transport: Joi.string().allow('', null).optional(),
    remarks: Joi.string().allow('', null).optional(),
    createdBy: Joi.string().allow('', null).optional(),
    updatedBy: Joi.string().allow('', null).optional(),
    totals: Joi.object({
      totalQty: Joi.number().optional(),
      grossAmt: Joi.number().optional(),
      discAmt: Joi.number().optional(),
      taxableAmt: Joi.number().optional(),
      cgst: Joi.number().optional(),
      sgst: Joi.number().optional(),
      igst: Joi.number().optional(),
      totalTax: Joi.number().optional(),
      netAmt: Joi.number().optional()
    }).optional(),
    details: Joi.array().items(
      Joi.object({
        slNo: Joi.number().integer().positive().optional(),
        barcode: Joi.string().allow('', null).optional(),
        partNo: Joi.string().trim().required().messages({
          'any.required': 'partNo is required',
          'string.empty': 'partNo cannot be empty'
        }),
        partName: Joi.string().trim().required().messages({
          'any.required': 'partName is required',
          'string.empty': 'partName cannot be empty'
        }),
        specification: Joi.string().allow('', null).optional(),
        brand: Joi.string().allow('', null).optional(),
        uom: Joi.string().allow('', null).optional(),
        qty: Joi.number().required().messages({
          'any.required': 'qty is required'
        }),
        rate: Joi.number().min(0).required().messages({
          'any.required': 'rate is required'
        }),
        grossAmt: Joi.number().optional(),
        discAmt: Joi.number().optional(),
        taxable: Joi.number().optional(),
        taxPercent: Joi.number().optional(),
        netRate: Joi.number().optional(),
        netAmt: Joi.number().optional(),
        isManual: Joi.boolean().optional()
      })
    ).min(1).required().messages({
      'any.required': 'Items list is required',
      'array.min': 'At least one item must be added'
    })
  }).unknown(true),
  query: Joi.object().unknown(true),
  params: Joi.object().unknown(true)
});

// Routes definition
router.get('/credit-sales/next-number', getNextNo);
router.get('/credit-sales', getAll);
router.get('/credit-sales/:id', getById);
router.post('/credit-sales', validateRequest(creditSaleSchema), create);
router.put('/credit-sales/:id', validateRequest(creditSaleSchema), update);
router.delete('/credit-sales/:id', remove);

export default router;
