import express from 'express'
import { dbSelect } from '../middlewares/dbSelect.js'
import {
  getNextNo, getAll, getOne, create, update, remove, upload, uploadDocument, downloadDocument
} from '../controllers/quotationSalesController.js'

const router = express.Router()

router.get('/quotation-sales/next-no', getNextNo)
router.get('/quotation-sales', getAll)
router.get('/quotation-sales/:id', getOne)
router.post('/quotation-sales', create)
router.put('/quotation-sales/:id', update)
router.delete('/quotation-sales/:id', remove)
router.post('/quotation-sales/:id/upload', upload.single('document'), uploadDocument)
router.get('/quotation-sales/:id/download-document', downloadDocument)

export default router
