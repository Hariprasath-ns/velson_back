import express from 'express';
import { dbSelect } from '../middlewares/dbSelect.js';
import { getAll, getNextCode, create, update, remove } from '../controllers/supplierMasterController.js';

const router = express.Router();


router.get('/supplier-master', getAll);
router.get('/supplier-master/next-code', getNextCode);
router.post('/supplier-master', create);
router.put('/supplier-master/:id', update);
router.delete('/supplier-master/:id', remove);

export default router;
