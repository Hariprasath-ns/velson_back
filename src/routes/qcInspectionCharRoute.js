import express from 'express';
import { getAll, getOne, create, update, remove } from '../controllers/qcInspectionCharController.js';

const router = express.Router();

router.get('/qc-inspection-char', getAll);
router.get('/qc-inspection-char/:id', getOne);
router.post('/qc-inspection-char', create);
router.put('/qc-inspection-char/:id', update);
router.delete('/qc-inspection-char/:id', remove);

export default router;
