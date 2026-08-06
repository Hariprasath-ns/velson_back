import express from 'express';
import { dbSelect } from '../middlewares/dbSelect.js';
import { getAll, getNextCode, create, update, remove, upload, uploadFiles, downloadImage, downloadPdf } from '../controllers/customerMasterController.js';

const router = express.Router();


router.get('/customer-master', getAll);
router.get('/customer-master/next-code', getNextCode);
router.post('/customer-master', create);
router.put('/customer-master/:id', update);
router.delete('/customer-master/:id', remove);
router.post('/customer-master/:id/upload', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), uploadFiles);
router.get('/customer-master/:id/download-image', downloadImage);
router.get('/customer-master/:id/download-pdf', downloadPdf);

export default router;
