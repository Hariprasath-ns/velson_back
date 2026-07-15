import express from 'express';
import { dbSelect } from '../middlewares/dbSelect.js';
import { getAll, create, update, remove } from '../controllers/serviceSpareController.js';

const router = express.Router();

router.get('/service-spare', getAll);
router.post('/service-spare', create);
router.put('/service-spare/:id', update);
router.delete('/service-spare/:id', remove);

export default router;
