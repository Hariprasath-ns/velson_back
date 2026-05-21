import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import { getNextNo, getDistinctValues, getAll, getOne, create, update, remove } from '../controllers/purchaseMasterController.js';

const router = express.Router();
router.use(dbSelect);

router.get('/purchase-master/next-no', getNextNo);
router.get('/purchase-master/distinct-values', getDistinctValues);
router.get('/purchase-master', getAll);
router.get('/purchase-master/:id', getOne);
router.post('/purchase-master', create);
router.put('/purchase-master/:id', update);
router.delete('/purchase-master/:id', remove);

export default router;
