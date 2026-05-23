import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import { upload, getAll, getNextCode, getById, create, update, remove } from '../controllers/companyMasterController.js';

const router = express.Router();

router.use(dbSelect);

router.get('/company-master', getAll);
router.get('/company-master/next-code', getNextCode);
router.get('/company-master/:id', getById);
router.post('/company-master', upload.single('logo'), create);
router.put('/company-master/:id', upload.single('logo'), update);
router.delete('/company-master/:id', remove);

export default router;
