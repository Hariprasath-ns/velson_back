import express from 'express';
import { dbSelect } from '../middlewares/dbSelect.js';
import { getNextNo, getAll, getOne, create, update, remove } from '../controllers/grnMasterController.js';

const router = express.Router();

router.get('/grn-master/next-no', getNextNo);
router.get('/grn-master', getAll);
router.get('/grn-master/:id', getOne);
router.post('/grn-master', create);
router.put('/grn-master/:id', update);
router.delete('/grn-master/:id', remove);

export default router;
