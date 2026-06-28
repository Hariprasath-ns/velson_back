import express from 'express';
import Joi from 'joi';
import { dbSelect } from '../middlewares/dbSelect.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { getAll, getById, create, update, remove } from '../controllers/outsourcePartsController.js';

const router = express.Router();

const outsourcePartsSchema = Joi.object({
  body: Joi.object({
    dcNo: Joi.string().trim().required().messages({
      'any.required': 'dcNo is required',
      'string.empty': 'dcNo cannot be empty'
    }),
    dcDate: Joi.string().allow('', null).optional(),
    customerId: Joi.number().integer().positive().allow(null).optional(),
    partyName: Joi.string().trim().required().messages({
      'any.required': 'partyName is required',
      'string.empty': 'partyName cannot be empty'
    }),
    address: Joi.string().allow('', null).optional(),
    items: Joi.array().items(
      Joi.object({
        slNo: Joi.number().integer().positive().optional(),
        itemName: Joi.string().trim().required().messages({
          'any.required': 'itemName is required',
          'string.empty': 'itemName cannot be empty'
        }),
        entryDate: Joi.string().allow('', null).optional()
      })
    ).min(1).required().messages({
      'any.required': 'items list is required',
      'array.min': 'At least one item must be added'
    })
  }).unknown(true),
  query: Joi.object().unknown(true),
  params: Joi.object().unknown(true)
});

router.get('/outsource-parts', getAll);
router.get('/outsource-parts/:id', getById);
router.post('/outsource-parts', validateRequest(outsourcePartsSchema), create);
router.put('/outsource-parts/:id', validateRequest(outsourcePartsSchema), update);
router.delete('/outsource-parts/:id', remove);

export default router;
