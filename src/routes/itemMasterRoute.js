import express from 'express';
import { dbSelect } from '../middlewares/dbSelect.js';
import { 
  getAll, getOne, create, update, remove, 
  upload, uploadFiles, getUploads, 
  downloadImage, downloadPdf, downloadUploadImage, downloadUploadPdf 
} from '../controllers/itemMasterController.js';

const router = express.Router();


router.get('/item-master', getAll);
router.get('/item-master/:id', getOne);
router.post('/item-master', create);
router.put('/item-master/:id', update);
router.delete('/item-master/:id', remove);
router.post('/item-master/:id/upload', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), uploadFiles);
router.get('/item-master/:id/uploads', getUploads);
router.get('/item-master/:id/download-image', downloadImage);
router.get('/item-master/:id/download-pdf', downloadPdf);
router.get('/item-master/upload/:id/download-image', downloadUploadImage);
router.get('/item-master/upload/:id/download-pdf', downloadUploadPdf);

export default router;
