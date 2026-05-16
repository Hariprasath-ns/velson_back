import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import { getAll, getOne, create, update, remove, uploadFiles, getUploads, upload } from '../controllers/itemMasterController.js';

const router = express.Router();

router.use(dbSelect);

router.get('/item-master', getAll);
router.get('/item-master/:id', getOne);
router.post('/item-master', create);
router.put('/item-master/:id', update);
router.delete('/item-master/:id', remove);
router.post('/item-master/:id/upload', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), uploadFiles);
router.get('/item-master/:id/uploads', getUploads);

export default router;
