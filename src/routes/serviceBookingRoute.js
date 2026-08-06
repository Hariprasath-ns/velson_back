import express from 'express';
import { dbSelect } from '../middlewares/dbSelect.js';
import { getAll, create, update, remove } from '../controllers/serviceBookingController.js';

const router = express.Router();

router.get('/service-booking', getAll);
router.post('/service-booking', create);
router.put('/service-booking/:id', update);
router.delete('/service-booking/:id', remove);

export default router;
