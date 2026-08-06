import express from 'express';
import { dbSelect } from '../middlewares/dbSelect.js';
import { getAll, create, update, remove } from '../controllers/vehicleServiceMasterController.js';

const router = express.Router();

router.get('/vehicle-service-master', getAll);
router.post('/vehicle-service-master', create);
router.put('/vehicle-service-master/:id', update);
router.delete('/vehicle-service-master/:id', remove);

export default router;
