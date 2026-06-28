import express from 'express';
import { dbSelect } from '../middlewares/dbSelect.js';
import { getAll, create, update, remove } from '../controllers/bomCreationController.js';

const router = express.Router();


router.get('/bom-creation', getAll);
router.post('/bom-creation', create);
router.put('/bom-creation/:id', update);
router.delete('/bom-creation/:id', remove);

export default router;
