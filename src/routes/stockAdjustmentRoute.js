import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import { getAll, create } from '../controllers/stockAdjustmentController.js';

const router = express.Router();
router.use(dbSelect);

router.get('/stock-adjustment', getAll);
router.post('/stock-adjustment', create);

export default router;
