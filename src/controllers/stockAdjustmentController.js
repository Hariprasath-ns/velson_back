import * as StockAdjustmentModel from '../models/stockAdjustmentModel.js';
import { BadRequestError, ValidationError } from "../middlewares/customErrors.js";
import { getActorContext } from '../utils/actorContext.js';
import { eventBus } from '../services/eventBus.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';

const validateAdjustment = (adj) => {
  if (!adj.partNo || typeof adj.partNo !== 'string' || !adj.partNo.trim()) {
    throw new BadRequestError('partNo is required and must be a non-empty string');
  }
  if (!adj.type || (adj.type !== 'INWARD' && adj.type !== 'OUTWARD')) {
    throw new BadRequestError('type must be either INWARD or OUTWARD');
  }
  if (adj.qty === undefined || isNaN(parseFloat(adj.qty)) || parseFloat(adj.qty) < 0) {
    throw new BadRequestError('qty is required and must be a non-negative number');
  }
};

export const getAll = async (req, res) => {
  try {
    const rawData = await StockAdjustmentModel.getAllStockAdjustments(req.db);
    const data = rawData.map(adj => {
      let voucherNo = '';
      const rem = String(adj.remarks || '').trim();
      const parts = rem.split(/\s+-\s+/);
      if (parts.length >= 2) {
        const prefix = parts[0].toLowerCase();
        if (prefix === 'qc inward') {
          voucherNo = parts[1].trim();
        } else if (prefix === 'grn inward') {
          voucherNo = parts[1].replace(/\s*\([^)]*\)$/, '').trim();
        }
      }

      if (!voucherNo) {
        const patternMatch = rem.match(/([A-Za-z0-9_-]+\/GRN\d+|GR\d{2,4}-\d{2,4}\/\d+|\d{2}-\d{2}\/GRN\d+)/i);
        if (patternMatch && patternMatch[1]) {
          voucherNo = patternMatch[1].trim();
        }
      }

      return {
        ...adj,
        voucherNo: voucherNo || (rem.toLowerCase().includes('opening stock') ? 'OPENING' : '—')
      };
    });
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const body = req.body;
    if (!body) {
      throw new BadRequestError('Request body is required');
    }

    if (Array.isArray(body)) {
      if (body.length === 0) {
        throw new BadRequestError('At least one adjustment must be provided');
      }
      body.forEach(validateAdjustment);
    } else {
      validateAdjustment(body);
    }

    // Attach creator information
    const userEmail = req.user?.email || 'Admin';
    const enrichRecord = (record) => ({
      ...record,
      createdBy: userEmail,
      updatedBy: userEmail
    });

    const enrichedData = Array.isArray(body) 
      ? body.map(enrichRecord) 
      : enrichRecord(body);

    const actorContext = await getActorContext(req);
    const record = await StockAdjustmentModel.createStockAdjustments(req.db, enrichedData, actorContext);
    
    // Publish stock adjustment event to trigger real-time updates
    eventBus.publish(SOCKET_EVENTS.STOCK_ADJUSTED, { data: record });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    throw err;
  }
};
