import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import { getAll, getNextCode, create, update, remove } from '../controllers/customerMasterController.js';

const router = express.Router();

router.use(dbSelect);

router.get('/customer-master', getAll);
router.get('/customer-master/next-code', getNextCode);
router.post('/customer-master', create);
router.put('/customer-master/:id', update);
router.delete('/customer-master/:id', remove);

export default router;
