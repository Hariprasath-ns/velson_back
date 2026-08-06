import express from 'express';
import { dbSelect } from '../middlewares/dbSelect.js';
import { getNextNo, getAll, getOne, getByNo, create, update, remove } from '../controllers/materialRequestController.js';

const router = express.Router();

router.get('/material-request/next-no', getNextNo);
router.get('/material-request/by-no/:mrNo', getByNo);
router.get('/material-request', getAll);
router.get('/material-request/:id', getOne);
router.post('/material-request', create);
router.put('/material-request/:id', update);
router.delete('/material-request/:id', remove);

export default router;
