import express from 'express';
import { getNextNo, getBOMItems, getBarcodes, createIssue } from '../controllers/materialIssueController.js';

const router = express.Router();

router.get('/material-issue/next-number', getNextNo);
router.get('/material-issue/bom-items', getBOMItems);
router.get('/material-issue/barcodes', getBarcodes);
router.post('/material-issue', createIssue);

export default router;
