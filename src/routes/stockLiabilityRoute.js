import express from 'express';
import { getStockLiabilityLedger, getVoucherTypes } from '../controllers/stockLiabilityController.js';

const router = express.Router();

router.get('/stock-liability', getStockLiabilityLedger);
router.get('/stock-liability/voucher-types', getVoucherTypes);

export default router;
