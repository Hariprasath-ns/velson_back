import express from 'express';
import {
  getAll,
  getGrnOptions,
  getOne,
  create,
  update,
  remove,
  approve,
  approveDirect,
} from '../controllers/qcEntryAgainstGrnController.js';

const router = express.Router();

router.get('/qc-entry-against-grn/grn-options', getGrnOptions);
router.get('/qc-entry-against-grn', getAll);
router.get('/qc-entry-against-grn/:id', getOne);
router.post('/qc-entry-against-grn', create);
router.put('/qc-entry-against-grn/:id', update);
router.delete('/qc-entry-against-grn/:id', remove);
router.post('/qc-entry-against-grn/:id/approve', approve);
router.put('/qc-entry-against-grn/:id/approve', approve);
router.post('/qc-entry-against-grn/approve-direct', approveDirect);

export default router;

