import * as JobCardModel from '../models/jobCardModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middlewares/customErrors.js";
import { eventBus } from '../services/eventBus.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';
import { getActorContext } from '../utils/actorContext.js';


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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await JobCardModel.getAllJobCards(req.db, page, limit);
    res.json({ success: true, ...result, data: result.data.map(mapResponse) });
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

    const actorContext = await getActorContext(req);
    eventBus.publish(SOCKET_EVENTS.JOBCARD_CREATED, {
      referenceId: record.id,
      referenceNumber: record.jobNo,
      referenceType: "jobcard",
      jobNo: record.jobNo,
      model: record.model || "N/A",
      userId: req.user?.id,
      actorContext
    });

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

    const original = await JobCardModel.getJobCardById(req.db, id);
    const detailRows = lineItems !== undefined ? buildDetailRows(lineItems) : undefined;
    const record = await JobCardModel.updateJobCard(req.db, id, headerData, detailRows);

    const actorContext = await getActorContext(req);
    if (original && original.status !== record.status) {
      if (record.status === 'In Process' || record.status === 'Started') {
        eventBus.publish(SOCKET_EVENTS.JOBCARD_STARTED, {
          referenceId: record.id,
          referenceNumber: record.jobNo,
          referenceType: "jobcard",
          jobNo: record.jobNo,
          userId: req.user?.id,
          actorContext
        });
      } else if (record.status === 'Completed' || record.status === 'Closed') {
        eventBus.publish(SOCKET_EVENTS.JOBCARD_COMPLETED, {
          referenceId: record.id,
          referenceNumber: record.jobNo,
          referenceType: "jobcard",
          jobNo: record.jobNo,
          userId: req.user?.id,
          actorContext
        });
      }
    }

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

    const beforeJc = await req.db.jobCard.findUnique({ where: { id: parseInt(jobCardId, 10) } });
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
    const afterJc = await req.db.jobCard.findUnique({ where: { id: parseInt(jobCardId, 10) } });

    if (beforeJc && afterJc) {
      const actorContext = await getActorContext(req);
      if (!beforeJc.workingStartDate && afterJc.workingStartDate) {
        eventBus.publish(SOCKET_EVENTS.JOBCARD_STARTED, {
          referenceId: afterJc.id,
          referenceNumber: afterJc.jobNo,
          referenceType: "jobcard",
          jobNo: afterJc.jobNo,
          userId: req.user?.id,
          actorContext
        });
      }
      if (!beforeJc.workingEndDate && afterJc.workingEndDate) {
        eventBus.publish(SOCKET_EVENTS.JOBCARD_COMPLETED, {
          referenceId: afterJc.id,
          referenceNumber: afterJc.jobNo,
          referenceType: "jobcard",
          jobNo: afterJc.jobNo,
          userId: req.user?.id,
          actorContext
        });
      }
    }

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

    const actorContext = await getActorContext(req);
    eventBus.publish(SOCKET_EVENTS.JOBCARD_COMPLETED, {
      referenceId: result.id,
      referenceNumber: result.jobNo,
      referenceType: "jobcard",
      jobNo: result.jobNo,
      userId: req.user?.id,
      actorContext
    });

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
