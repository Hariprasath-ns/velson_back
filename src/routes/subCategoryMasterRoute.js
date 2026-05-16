import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import { getAll, getByCategory, create, update, remove } from '../controllers/subCategoryMasterController.js';

const router = express.Router();
router.use(dbSelect);

router.get('/subcategories', getAll);
router.get('/subcategories/category/:categoryId', getByCategory);  // must be before /:id
router.post('/subcategories', create);
router.put('/subcategories/:id', update);
router.delete('/subcategories/:id', remove);

export default router;
