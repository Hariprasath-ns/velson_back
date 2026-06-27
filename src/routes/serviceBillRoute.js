import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import { authenticate } from '../middelwares/auth.js';
import { getNextRef, getAll, getById, create, update, remove, requestCancel, approveCancel } from '../controllers/serviceBillController.js';

const router = express.Router();
router.use(dbSelect);

router.get('/service-bill', getAll);
router.get('/service-bill/next-ref', getNextRef);
router.get('/service-bill/:id', getById);
router.post('/service-bill', create);
router.put('/service-bill/:id', update);
router.delete('/service-bill/:id', remove);
router.put('/service-bill/:id/request-cancel', authenticate, requestCancel);
router.put('/service-bill/:id/approve-cancel', authenticate, approveCancel);

export default router;
