import express from 'express';
import { dbSelect } from '../middlewares/dbSelect.js';
import { getAll, create, update, remove } from '../controllers/prefixController.js';

const router = express.Router();


router.get('/prefixes', getAll);
router.post('/prefixes', create);
router.put('/prefixes/:id', update);
router.delete('/prefixes/:id', remove);

export default router;
