import express from 'express';
import { dbSelect } from '../middelwares/dbSelect.js';
import { getAll, getOne, create, update, remove } from '../controllers/qcCheckMethodController.js';

const router = express.Router();

router.use(dbSelect);

router.get('/qc-check-method', getAll);
router.get('/qc-check-method/:id', getOne);
router.post('/qc-check-method', create);
router.put('/qc-check-method/:id', update);
router.delete('/qc-check-method/:id', remove);

export default router;
