import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import { getNextRef, getAll, getById, create, update, remove } from '../controllers/serviceBillController.js';

const router = express.Router();
router.use(dbSelect);

router.get('/service-bill', getAll);
router.get('/service-bill/next-ref', getNextRef);
router.get('/service-bill/:id', getById);
router.post('/service-bill', create);
router.put('/service-bill/:id', update);
router.delete('/service-bill/:id', remove);

export default router;
