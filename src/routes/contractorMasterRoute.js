import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import { getAll, getNextCode, create, update, remove } from '../controllers/contractorMasterController.js';

const router = express.Router();

router.use(dbSelect);

router.get('/contractor-master', getAll);
router.get('/contractor-master/next-code', getNextCode);
router.post('/contractor-master', create);
router.put('/contractor-master/:id', update);
router.delete('/contractor-master/:id', remove);

export default router;
