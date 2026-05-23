import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import { getAll, getNextCode, create, update, remove } from '../controllers/machineMasterController.js';

const router = express.Router();
router.use(dbSelect);

router.get('/machine-master/next-code', getNextCode);
router.get('/machine-master', getAll);
router.post('/machine-master', create);
router.put('/machine-master/:id', update);
router.delete('/machine-master/:id', remove);

export default router;
