import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import { getAll, getNextCode, getById, create, update, remove, upload, uploadFiles, downloadImage, removeImage } from '../controllers/customerComplaintController.js';

const router = express.Router();

router.use(dbSelect);

router.get('/customer-complaint', getAll);
router.get('/customer-complaint/next-code', getNextCode);
router.get('/customer-complaint/:id', getById);
router.post('/customer-complaint', create);
router.put('/customer-complaint/:id', update);
router.delete('/customer-complaint/:id', remove);

router.post('/customer-complaint/:id/upload', upload.array('images', 10), uploadFiles);
router.get('/customer-complaint/image/:imageId', downloadImage);
router.delete('/customer-complaint/image/:imageId', removeImage);

export default router;
