import express from 'express';
import { dbSelect } from '../middlewares/dbSelect.js';
import { getNextNo, getNextBarcode, getAll, getOne, create, remove } from '../controllers/materialInwardController.js';

const router = express.Router();

router.get('/material-inward/next-no', getNextNo);
router.get('/material-inward/next-barcode', getNextBarcode);
router.get('/material-inward', getAll);
router.get('/material-inward/:id', getOne);
router.post('/material-inward', create);
router.delete('/material-inward/:id', remove);

export default router;
