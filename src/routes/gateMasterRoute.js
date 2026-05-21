import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import { getNextNo, getAll, getOne, create, update, remove } from '../controllers/gateMasterController.js';

const router = express.Router();
router.use(dbSelect);

router.get('/gate-master/next-no', getNextNo);
router.get('/gate-master', getAll);
router.get('/gate-master/:id', getOne);
router.post('/gate-master', create);
router.put('/gate-master/:id', update);
router.delete('/gate-master/:id', remove);

export default router;
