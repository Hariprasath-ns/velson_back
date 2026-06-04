import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import { getAll, create, update, remove } from '../controllers/bomCreationController.js';

const router = express.Router();

router.use(dbSelect);

router.get('/bom-creation', getAll);
router.post('/bom-creation', create);
router.put('/bom-creation/:id', update);
router.delete('/bom-creation/:id', remove);

export default router;
