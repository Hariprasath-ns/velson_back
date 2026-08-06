import express from 'express';
import { dbSelect } from '../middlewares/dbSelect.js';
import { getAll, getNextCode, getById, create, update, remove } from '../controllers/employeeMasterController.js';

const router = express.Router();

router.get('/employee-master', getAll);
router.get('/employee-master/next-code', getNextCode);
router.get('/employee-master/:id', getById);
router.post('/employee-master', create);
router.put('/employee-master/:id', update);
router.delete('/employee-master/:id', remove);

export default router;
