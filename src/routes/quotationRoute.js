import express from 'express'
import { dbSelect } from '../middlewares/dbSelect.js'
import {
  getNextNo, getAll, getOne, create, update, remove, upload, uploadDocument, downloadDocument,
  getMarketingLogs, createMarketingLog, uploadMarketingLogDoc, downloadMarketingLogDoc, deleteMarketingLog
} from '../controllers/quotationController.js'

const router = express.Router()

router.get('/quotation-master/next-no', getNextNo)
router.get('/quotation-master', getAll)
router.get('/quotation-master/:id', getOne)
router.post('/quotation-master', create)
router.put('/quotation-master/:id', update)
router.delete('/quotation-master/:id', remove)
router.post('/quotation-master/:id/upload', upload.single('document'), uploadDocument)
router.get('/quotation-master/:id/download-document', downloadDocument)

// Marketing Log / General Document Upload
router.get('/marketing-log', getMarketingLogs)
router.post('/marketing-log', createMarketingLog)
router.post('/marketing-log/:id/upload', upload.single('document'), uploadMarketingLogDoc)
router.get('/marketing-log/:id/download', downloadMarketingLogDoc)
router.delete('/marketing-log/:id', deleteMarketingLog)

export default router

