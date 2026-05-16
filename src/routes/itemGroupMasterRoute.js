import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import { getAll, create, update, remove } from '../controllers/itemGroupMasterController.js';

const router = express.Router();

router.use(dbSelect);

router.get('/item-group-master', getAll);
router.post('/item-group-master', create);
router.put('/item-group-master/:id', update);
router.delete('/item-group-master/:id', remove);

export default router;
