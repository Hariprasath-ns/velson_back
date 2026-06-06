import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import { getAll, create, update, remove, removeAll } from '../controllers/processMasterController.js';

const router = express.Router();

router.use(dbSelect);

router.get('/process-master', getAll);
router.post('/process-master', create);
router.put('/process-master/:id', update);
router.delete('/process-master/all', removeAll);
router.delete('/process-master/:id', remove);

export default router;
