import express from 'express';
import { dbSelect } from '../middlewares/dbSelect.js';
import { upload, getAll, getNextCode, getById, create, update, remove, downloadLogo } from '../controllers/companyMasterController.js';

const router = express.Router();


router.get('/company-master', getAll);
router.get('/company-master/next-code', getNextCode);
router.get('/company-master/:id', getById);
router.post('/company-master', upload.single('logo'), create);
router.put('/company-master/:id', upload.single('logo'), update);
router.delete('/company-master/:id', remove);
router.get('/company-master/:id/download-logo', downloadLogo);

export default router;
