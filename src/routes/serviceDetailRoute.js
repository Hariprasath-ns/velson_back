import express from 'express';
import { dbSelect } from '../middlewares/dbSelect.js';
import { getAll, create, update, remove } from '../controllers/serviceDetailController.js';

const router = express.Router();

router.get('/service-detail', getAll);
router.post('/service-detail', create);
router.put('/service-detail/:id', update);
router.delete('/service-detail/:id', remove);

export default router;
