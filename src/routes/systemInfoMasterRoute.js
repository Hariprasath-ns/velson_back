import express from 'express';
import { dbSelect } from '../middlewares/dbSelect.js';
import { getAll, getById, create, update, remove } from '../controllers/systemInfoMasterController.js';

const router = express.Router();

router.get('/system-info-master', getAll);
router.get('/system-info-master/:id', getById);
router.post('/system-info-master', create);
router.put('/system-info-master/:id', update);
router.delete('/system-info-master/:id', remove);

export default router;
