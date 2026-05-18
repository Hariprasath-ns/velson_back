import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import { getAll, create, update, remove } from '../controllers/vehicleMasterController.js';

const router = express.Router();

router.use(dbSelect);

router.get('/vehicle-master', getAll);
router.post('/vehicle-master', create);
router.put('/vehicle-master/:id', update);
router.delete('/vehicle-master/:id', remove);

export default router;
