import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import { getAll, getOne, create, update, remove } from '../controllers/itemMasterController.js';

const router = express.Router();

router.use(dbSelect);

router.get('/item-master', getAll);
router.get('/item-master/:id', getOne);
router.post('/item-master', create);
router.put('/item-master/:id', update);
router.delete('/item-master/:id', remove);

export default router;
