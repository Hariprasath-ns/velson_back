import express from 'express';
import { dbSelect } from '../middlewares/dbSelect.js';
import { getNextNo, getAll, getOne, create, update, remove } from '../controllers/purchaseRequestController.js';

const router = express.Router();

router.get('/purchase-request/next-no', getNextNo);
router.get('/purchase-request', getAll);
router.get('/purchase-request/:id', getOne);
router.post('/purchase-request', create);
router.put('/purchase-request/:id', update);
router.delete('/purchase-request/:id', remove);

export default router;
