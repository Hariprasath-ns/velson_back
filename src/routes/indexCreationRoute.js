import express from 'express';
import { dbSelect } from '../middlewares/dbSelect.js';
import { 
  getAll, getOne, create, update, remove, nextNo,
  upload, uploadFiles, getUploads, downloadImage, downloadUploadImage
} from '../controllers/indexCreationController.js';

const router = express.Router();


router.get('/index-creation/next-no', nextNo);
router.get('/index-creation/:id', getOne);
router.get('/index-creation', getAll);
router.post('/index-creation', create);
router.put('/index-creation/:id', update);
router.delete('/index-creation/:id', remove);
router.post('/index-creation/:id/upload', upload.fields([{ name: 'image', maxCount: 1 }]), uploadFiles);
router.get('/index-creation/:id/uploads', getUploads);
router.get('/index-creation/:id/download-image', downloadImage);
router.get('/index-creation/upload/:id/download-image', downloadUploadImage);

export default router;
