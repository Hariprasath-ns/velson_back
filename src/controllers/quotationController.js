import * as QuotationModel from '../models/quotationModel.js'
import multer from 'multer'
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middlewares/customErrors.js";


const storage = multer.memoryStorage()
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
})

const toFloat = (v) => (v !== '' && v != null ? parseFloat(v) || 0 : 0)
const toInt   = (v) => (v !== '' && v != null ? parseInt(v, 10) || 0 : 0)

const buildDetailRows = (items = []) =>
  items.map((item) => ({
    itemId:      item.itemId ? parseInt(item.itemId, 10) : null,
    partNo:      item.partNo      || null,
    itemName:    item.itemName    || null,
    description: item.description || null,
    hsnCode:     item.hsnCode     || null,
    uom:         item.uom         || null,
    qty:         toFloat(item.qty),
    unitPrice:   toFloat(item.unitPrice),
    amount:      toFloat(item.amount),
  }))

export const getNextNo = async (req, res) => {
  try {
    const result = await QuotationModel.getNextQuotationNo(req.db)
    res.json({ success: true, ...result })
  } catch (err) {
    
    throw err;
  }
}

export const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const result = await QuotationModel.getAllQuotations(req.db, page, limit)
    res.json({ success: true, ...result })
  } catch (err) {
    
    throw err;
  }
}

export const getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const data = await QuotationModel.getQuotationById(req.db, id)
    if (!data) throw new NotFoundError('Quotation not found');
    res.json({ success: true, data })
  } catch (err) {
    
    throw err;
  }
}

export const create = async (req, res) => {
  try {
    const {
      quotationNo, financialYear, customerId, customerRef,
      currencyCode, exchangeRate, modelRef, taxType,
      quotationDate, validUntil, revisionNo, quotationType,
      discountType, showTotalsGrid, specialDiscount, freightAmount,
      taxPercent, packingForwarding, subTotal, taxAmount, totalAmount,
      paymentTerms, status, createdBy, items,
    } = req.body

    if (!quotationNo || !customerId) {
      throw new BadRequestError('quotationNo and customerId are required');
    }

    const headerData = {
      quotationNo:      quotationNo.trim(),
      financialYear:    financialYear || '',
      customerId:       parseInt(customerId, 10),
      customerRef:      customerRef      || null,
      currencyCode:     currencyCode     || 'INR',
      exchangeRate:     toFloat(exchangeRate) || 1,
      modelRef:         modelRef         || null,
      taxType:          taxType          || null,
      quotationDate:    quotationDate ? new Date(quotationDate) : new Date(),
      validUntil:       validUntil ? new Date(validUntil) : null,
      revisionNo:       toInt(revisionNo),
      quotationType:    quotationType    || null,
      discountType:     discountType     || 'Dis_Per',
      showTotalsGrid:   Boolean(showTotalsGrid),
      specialDiscount:  toFloat(specialDiscount),
      freightAmount:    toFloat(freightAmount),
      taxPercent:       toFloat(taxPercent),
      packingForwarding: toFloat(packingForwarding),
      subTotal:         toFloat(subTotal),
      taxAmount:        toFloat(taxAmount),
      totalAmount:      toFloat(totalAmount),
      paymentTerms:     paymentTerms || null,
      status:           status       || 'Draft',
      createdBy:        createdBy    || 'ADMIN',
      updatedBy:        createdBy    || 'ADMIN',
    }

    const record = await QuotationModel.createQuotation(req.db, headerData, buildDetailRows(items))
    res.status(201).json({ success: true, data: record })
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ConflictError('Quotation number already exists');
    }
    if (err.code === 'P2003') {
      throw new BadRequestError('Invalid customer reference');
    }
    
    throw err;
  }
}

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const {
      customerRef, currencyCode, exchangeRate, modelRef, taxType,
      quotationDate, validUntil, revisionNo, quotationType,
      discountType, showTotalsGrid, specialDiscount, freightAmount,
      taxPercent, packingForwarding, subTotal, taxAmount, totalAmount,
      paymentTerms, status, updatedBy, items,
    } = req.body

    const headerData = {
      customerRef:      customerRef      || null,
      currencyCode:     currencyCode     || 'INR',
      exchangeRate:     toFloat(exchangeRate) || 1,
      modelRef:         modelRef         || null,
      taxType:          taxType          || null,
      quotationDate:    quotationDate ? new Date(quotationDate) : new Date(),
      validUntil:       validUntil ? new Date(validUntil) : null,
      revisionNo:       toInt(revisionNo),
      quotationType:    quotationType    || null,
      discountType:     discountType     || 'Dis_Per',
      showTotalsGrid:   Boolean(showTotalsGrid),
      specialDiscount:  toFloat(specialDiscount),
      freightAmount:    toFloat(freightAmount),
      taxPercent:       toFloat(taxPercent),
      packingForwarding: toFloat(packingForwarding),
      subTotal:         toFloat(subTotal),
      taxAmount:        toFloat(taxAmount),
      totalAmount:      toFloat(totalAmount),
      paymentTerms:     paymentTerms || null,
      status:           status       || 'Draft',
      updatedBy:        updatedBy    || 'ADMIN',
    }

    const record = await QuotationModel.updateQuotation(req.db, id, headerData, buildDetailRows(items))
    res.json({ success: true, data: record })
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Quotation not found');
    }
    
    throw err;
  }
}

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    await QuotationModel.deleteQuotation(req.db, id)
    res.json({ success: true })
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Quotation not found');
    }
    
    throw err;
  }
}

export const uploadDocument = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (!req.file) {
      throw new BadRequestError('No document uploaded');
    }

    const updateData = {
      documentData: req.file.buffer,
      documentMimeType: req.file.mimetype,
      documentPath: req.file.originalname,
      updatedBy: req.body.updatedBy || 'ADMIN',
    }

    const record = await req.db.quotationMaster.update({
      where: { id },
      data: updateData,
    })
    
    res.json({ success: true, data: record })
  } catch (err) {
    
    throw err;
  }
}

export const downloadDocument = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const quotation = await req.db.quotationMaster.findUnique({ where: { id } })
    
    if (!quotation || !quotation.documentData) {
      throw new NotFoundError('Document not found');
    }

    res.set('Content-Type', quotation.documentMimeType || 'application/pdf')
    res.set('Content-Disposition', `inline; filename="${quotation.documentPath || 'document'}"`)
    res.send(quotation.documentData)
  } catch (err) {
    
    throw err;
  }
}

// Marketing Log Handlers
export const getMarketingLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const where = {}
    if (startDate || endDate) {
      where.logDate = {}
      if (startDate) {
        const d = new Date(startDate + 'T00:00:00.000Z')
        if (!isNaN(d.getTime())) where.logDate.gte = d
      }
      if (endDate) {
        const d = new Date(endDate + 'T23:59:59.999Z')
        if (!isNaN(d.getTime())) where.logDate.lte = d
      }
      if (Object.keys(where.logDate).length === 0) {
        delete where.logDate
      }
    }
    const data = await req.db.marketingLog.findMany({
      where,
      orderBy: { logDate: 'desc' },
    })
    res.json({ success: true, data })
  } catch (err) {
    
    throw err;
  }
}

export const createMarketingLog = async (req, res) => {
  try {
    const { ledgerName, customerCode, logDate, remarks, createdBy } = req.body
    if (!ledgerName || !customerCode) {
      throw new BadRequestError('ledgerName and customerCode are required');
    }
    const record = await req.db.marketingLog.create({
      data: {
        ledgerName,
        customerCode,
        logDate: logDate ? new Date(logDate) : new Date(),
        remarks: remarks || '',
        createdBy: createdBy || 'ADMIN',
      }
    })
    res.status(201).json({ success: true, data: record })
  } catch (err) {
    
    throw err;
  }
}

export const uploadMarketingLogDoc = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (!req.file) {
      throw new BadRequestError('No document uploaded');
    }
    const record = await req.db.marketingLog.update({
      where: { id },
      data: {
        documentData: req.file.buffer,
        documentMimeType: req.file.mimetype,
        documentPath: req.file.originalname,
      }
    })
    res.json({ success: true, data: record })
  } catch (err) {
    
    throw err;
  }
}

export const downloadMarketingLogDoc = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const log = await req.db.marketingLog.findUnique({ where: { id } })
    if (!log || !log.documentData) {
      throw new NotFoundError('Document not found');
    }
    res.set('Content-Type', log.documentMimeType || 'application/octet-stream')
    res.set('Content-Disposition', `inline; filename="${log.documentPath || 'document'}"`)
    res.send(log.documentData)
  } catch (err) {
    
    throw err;
  }
}

export const deleteMarketingLog = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    await req.db.marketingLog.delete({ where: { id } })
    res.json({ success: true })
  } catch (err) {
    
    throw err;
  }
}

