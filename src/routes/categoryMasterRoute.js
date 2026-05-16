import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import { getAll, create, update, remove } from '../controllers/categoryMasterController.js';

const router = express.Router();
router.use(dbSelect);

router.get('/categories', getAll);
router.post('/categories', create);
router.put('/categories/:id', update);
router.delete('/categories/:id', remove);

export default router;
