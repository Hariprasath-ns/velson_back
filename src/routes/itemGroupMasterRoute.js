import express from 'express';
import { dbSelect } from '../middlewares/dbSelect.js';
import { getAll, create, update, remove } from '../controllers/itemGroupMasterController.js';

const router = express.Router();


router.get('/item-group-master', getAll);
router.post('/item-group-master', create);
router.put('/item-group-master/:id', update);
router.delete('/item-group-master/:id', remove);

export default router;
