import * as JobCardModel from '../models/jobCardModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middelwares/customErrors.js";


const toFloat = (v) => (v !== '' && v != null ? parseFloat(v) || 0 : 0);

const parseBase64Image = (partImage) => {
  if (partImage && typeof partImage === 'string' && partImage.startsWith('data:')) {
    const matches = partImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      return {
        partImageMime: matches[1],
        partImage: Buffer.from(matches[2], 'base64'),
      };
    }
  }
  return { partImage: null, partImageMime: null };
};

const mapResponse = (jc) => {
  if (!jc) return null;
  return {
    ...jc,
    currentDate: jc.currentDate ? jc.currentDate.toISOString().split('T')[0] : null,
    requiredDate: jc.requiredDate ? jc.requiredDate.toISOString().split('T')[0] : null,
    workingStartDate: jc.workingStartDate ? jc.workingStartDate.toISOString().split('T')[0] : null,
    workingEndDate: jc.workingEndDate ? jc.workingEndDate.toISOString().split('T')[0] : null,
    partImage: jc.partImage ? `data:${jc.partImageMime || 'image/jpeg'};base64,${jc.partImage.toString('base64')}` : null,
  };
};

const buildDetailRows = (items = []) =>
  items.map((item) => ({
    partNo:   item.partNo || '',
    partName: item.partName || '',
    planQty:  item.planQty ? toFloat(item.planQty) : null,
    uom:      item.uom || item.unit || null,
  }));

export const getAll = async (req, res) => {
  try {
    const records = await JobCardModel.getAllJobCards(req.db);
    res.json({ success: true, data: records.map(mapResponse) });
  } catch (err) {
    
    throw err;
  }
};

export const getNextNo = async (req, res) => {
  try {
    const jobNo = await JobCardModel.getNextJobNo(req.db);
    res.json({ success: true, jobNo });
  } catch (err) {
    
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const {
      jobNo, model, qtyV, currentDate, priority, requiredDate, note, partImage, lineItems,
      selfStockIn, selectedCustomers
    } = req.body;

    if (!jobNo) {
      throw new BadRequestError('jobNo is required');
    }

    const { partImage: imgBuffer, partImageMime: imgMime } = parseBase64Image(partImage);

    const headerData = {
      jobNo: jobNo.trim(),
      model: model || null,
      qtyV: qtyV ? toFloat(qtyV) : null,
      currentDate: currentDate ? new Date(currentDate) : null,
      priority: priority || null,
      requiredDate: requiredDate ? new Date(requiredDate) : null,
      note: note || null,
      partImage: imgBuffer,
      partImageMime: imgMime,
      selfStockIn: selfStockIn !== undefined ? !!selfStockIn : false,
      selectedCustomers: selectedCustomers || null,
    };

    const record = await JobCardModel.createJobCard(req.db, headerData, buildDetailRows(lineItems));
    res.status(201).json({ success: true, data: mapResponse(record) });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ConflictError('Job number already exists');
    }
    
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      model, qtyV, currentDate, priority, requiredDate, note, partImage, lineItems,
      status, approvedDate, rejectedDate, cancelledDate, cancellationReason, approvedBy,
      selfStockIn, selectedCustomers
    } = req.body;

    const { partImage: imgBuffer, partImageMime: imgMime } = parseBase64Image(partImage);

    const headerData = {
      ...(model !== undefined && { model: model || null }),
      ...(qtyV !== undefined && { qtyV: qtyV ? toFloat(qtyV) : null }),
      ...(currentDate !== undefined && { currentDate: currentDate ? new Date(currentDate) : null }),
      ...(priority !== undefined && { priority: priority || null }),
      ...(requiredDate !== undefined && { requiredDate: requiredDate ? new Date(requiredDate) : null }),
      ...(note !== undefined && { note: note || null }),
      ...(partImage !== undefined && { partImage: imgBuffer, partImageMime: imgMime }),
      status: status !== undefined ? status : undefined,
      approvedDate: approvedDate ? new Date(approvedDate) : (approvedDate === null ? null : undefined),
      approvedBy: approvedBy !== undefined ? approvedBy : undefined,
      rejectedDate: rejectedDate ? new Date(rejectedDate) : (rejectedDate === null ? null : undefined),
      cancelledDate: cancelledDate ? new Date(cancelledDate) : (cancelledDate === null ? null : undefined),
      cancellationReason: cancellationReason !== undefined ? cancellationReason : undefined,
      ...(selfStockIn !== undefined && { selfStockIn: !!selfStockIn }),
      ...(selectedCustomers !== undefined && { selectedCustomers: selectedCustomers || null }),
    };

    const detailRows = lineItems !== undefined ? buildDetailRows(lineItems) : undefined;
    const record = await JobCardModel.updateJobCard(req.db, id, headerData, detailRows);
    res.json({ success: true, data: mapResponse(record) });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Job Card not found');
    }
    
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await JobCardModel.deleteJobCard(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('Job Card not found');
    }
    
    throw err;
  }
};

export const updateProcess = async (req, res) => {
  try {
    const {
      jobCardId, partNo, partName, processName, processDate, state,
      empName, machineName, workCenterNo, remarks, notApplicable
    } = req.body;

    if (!jobCardId || !partNo || !processName) {
      throw new BadRequestError('jobCardId, partNo, and processName are required');
    }

    const result = await JobCardModel.upsertJobCardProcess(req.db, {
      jobCardId: parseInt(jobCardId, 10),
      partNo,
      partName: partName || '',
      processName,
      processDate: processDate ? new Date(processDate) : null,
      state: state || null,
      empName: empName || null,
      machineName: machineName || null,
      workCenterNo: workCenterNo || null,
      remarks: remarks || null,
      notApplicable: !!notApplicable
    });

    res.json({ success: true, data: result });
  } catch (err) {
    throw err;
  }
};

export const closeRouteCard = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new BadRequestError('Invalid Job Card ID');
    }
    const result = await JobCardModel.closeRouteCard(req.db, id);
    res.json({ success: true, data: mapResponse(result) });
  } catch (err) {
    throw err;
  }
};

export const getJobProcessMenu = async (req, res) => {
  try {
    const { jobNo } = req.query;
    if (!jobNo) {
      throw new BadRequestError('jobNo query parameter is required');
    }
    const result = await JobCardModel.getJobProcessMenu(req.db, jobNo);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err.message.includes('not found')) {
      throw new NotFoundError(err.message);
    }
    throw err;
  }
};

export const updateJobProcessMenu = async (req, res) => {
  try {
    const { jobNo, partNo, processes } = req.body;
    if (!jobNo || !processes || !Array.isArray(processes)) {
      throw new BadRequestError('jobNo and processes array are required');
    }
    const result = await JobCardModel.updateJobProcessMenu(req.db, jobNo, partNo, processes);
    res.json({ success: true, ...result });
  } catch (err) {
    if (err.message.includes('not found')) {
      throw new NotFoundError(err.message);
    }
    throw err;
  }
};
