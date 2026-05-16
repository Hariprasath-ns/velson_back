import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import {
  getAll, create, update, remove,
  generatePartNumber, previewPartNumber,
} from '../controllers/partNumberBaseController.js';

const router = express.Router();
router.use(dbSelect);

router.get('/part-number-base', getAll);
router.get('/part-number-base/preview', previewPartNumber);   // before /:id
router.post('/part-number-base', create);
router.put('/part-number-base/:id', update);
router.delete('/part-number-base/:id', remove);

router.post('/generate-part-number', generatePartNumber);

export default router;
