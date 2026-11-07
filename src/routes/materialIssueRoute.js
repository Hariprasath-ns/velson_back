import express from 'express';
import { getNextNo, getBOMItems, getIssuedItems, getBarcodes, createIssue, getAllIssues, getBarcodeDetails, deductStock, restoreStock } from '../controllers/materialIssueController.js';

const router = express.Router();

router.get('/material-issue', getAllIssues);
router.get('/material-issue/next-number', getNextNo);
router.get('/material-issue/bom-items', getBOMItems);
router.get('/material-issue/issued-items', getIssuedItems);
router.get('/material-issue/barcodes', getBarcodes);
router.get('/material-issue/barcode/:barcode', getBarcodeDetails);
router.post('/material-issue/deduct-stock', deductStock);
router.post('/material-issue/restore-stock', restoreStock);
router.post('/material-issue', createIssue);

export default router;

