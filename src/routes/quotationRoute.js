import express from 'express'
import { dbSelect } from '../middelwares/dbSelect.js'
import { getNextNo, getAll, getOne, create, update, remove } from '../controllers/quotationController.js'

const router = express.Router()
router.use(dbSelect)

router.get('/quotation-master/next-no', getNextNo)
router.get('/quotation-master', getAll)
router.get('/quotation-master/:id', getOne)
router.post('/quotation-master', create)
router.put('/quotation-master/:id', update)
router.delete('/quotation-master/:id', remove)

export default router
