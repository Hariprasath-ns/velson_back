import express from 'express';
import { dbSelect } from '../middlewares/dbSelect.js';
import { getAll, getOne, create, update, remove } from '../controllers/partUsageListController.js';

const router = express.Router();


router.get('/part-usage-list', getAll);
router.get('/part-usage-list/:id', getOne);
router.post('/part-usage-list', create);
router.put('/part-usage-list/:id', update);
router.delete('/part-usage-list/:id', remove);

export default router;
