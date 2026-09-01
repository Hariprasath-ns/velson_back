import * as BomModel from '../models/bomCreationModel.js';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middlewares/customErrors.js";
import { eventBus } from '../services/eventBus.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';
import { getActorContext } from '../utils/actorContext.js';


export const getAll = async (req, res) => {
  try {
    const data = await BomModel.getAllBomCreations(req.db);
    res.json({ success: true, data });
  } catch (err) {
    
    throw err;
  }
};

export const create = async (req, res) => {
  try {
    const {
      bomNo, date, customerName, customerCode, vehicleCount,
      serviceJobNo, vehicleSerialNo, model, fileLocation,
      fileName, groupName, assemblyPartNo, status, excelRows,
      createdBy
    } = req.body;

    if (!customerName || !String(customerName).trim()) {
      throw new BadRequestError('customerName is required');
    }
    if (!serviceJobNo || !String(serviceJobNo).trim()) {
      throw new BadRequestError('serviceJobNo is required');
    }

    // Enforce uniqueness for Service Job No. + File Name / Assembly Part No
    if (fileName || assemblyPartNo) {
      const existing = await req.db.bomCreation.findFirst({
        where: {
          serviceJobNo: String(serviceJobNo).trim(),
          ...(fileName ? { fileName: String(fileName).trim() } : {}),
          ...(assemblyPartNo && !fileName ? { assemblyPartNo: String(assemblyPartNo).trim() } : {}),
        }
      });
      if (existing) {
        throw new ConflictError(`BOM already exists for Service Job No "${serviceJobNo}"${fileName ? ` and File "${fileName}"` : ''}${assemblyPartNo ? ` and Assembly "${assemblyPartNo}"` : ''}. Duplicate entries are not allowed.`);
      }
    }

    // Auto-resolve unique bomNo if not provided or already exists
    let finalBomNo = bomNo ? String(bomNo).trim() : '';
    if (!finalBomNo) {
      const allBoms = await req.db.bomCreation.findMany({ select: { bomNo: true } });
      const nums = allBoms.map(r => {
        const m = (r.bomNo || '').match(/\d+$/);
        return m ? parseInt(m[0], 10) : null;
      }).filter(n => n !== null && !isNaN(n) && n < 10000000);
      const max = nums.length > 0 ? Math.max(...nums) : 0;
      finalBomNo = `BOM-${max + 1}`;
    } else {
      const exists = await req.db.bomCreation.findUnique({ where: { bomNo: finalBomNo } });
      if (exists) {
        const allBoms = await req.db.bomCreation.findMany({ select: { bomNo: true } });
        const nums = allBoms.map(r => {
          const m = (r.bomNo || '').match(/\d+$/);
          return m ? parseInt(m[0], 10) : null;
        }).filter(n => n !== null && !isNaN(n) && n < 10000000);
        const max = nums.length > 0 ? Math.max(...nums) : 0;
        finalBomNo = `BOM-${max + 1}`;
      }
    }

    const record = await BomModel.createBomCreation(req.db, {
      bomNo: finalBomNo,
      date: date ? new Date(date) : new Date(),
      customerName: String(customerName).trim(),
      customerCode: customerCode || null,
      vehicleCount: vehicleCount ? parseInt(vehicleCount) : null,
      serviceJobNo: String(serviceJobNo).trim(),
      vehicleSerialNo: vehicleSerialNo || null,
      model: model || null,
      fileLocation: fileLocation || null,
      fileName: fileName || null,
      groupName: groupName || null,
      assemblyPartNo: assemblyPartNo || null,
      status: status || 'Created',
      excelRows: excelRows || null,
      createdBy: createdBy || 'Admin',
      updatedBy: createdBy || 'Admin',
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new BadRequestError('BOM No already exists');
    }
    
    throw err;
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      bomNo, date, customerName, customerCode, vehicleCount,
      serviceJobNo, vehicleSerialNo, model, fileLocation,
      fileName, groupName, assemblyPartNo, status, excelRows,
      updatedBy
    } = req.body;

    if (!customerName || !String(customerName).trim()) {
      throw new BadRequestError('customerName is required');
    }

    const record = await BomModel.updateBomCreation(req.db, id, {
      bomNo: bomNo ? String(bomNo).trim() : undefined,
      date: date ? new Date(date) : undefined,
      customerName: String(customerName).trim(),
      customerCode: customerCode || null,
      vehicleCount: vehicleCount ? parseInt(vehicleCount) : null,
      serviceJobNo: serviceJobNo ? String(serviceJobNo).trim() : undefined,
      vehicleSerialNo: vehicleSerialNo || null,
      model: model || null,
      fileLocation: fileLocation || null,
      fileName: fileName || null,
      groupName: groupName || null,
      assemblyPartNo: assemblyPartNo || null,
      status: status || 'Created',
      excelRows: excelRows || null,
      updatedBy: updatedBy || 'Admin',
    });

    const actorContext = await getActorContext(req);
    eventBus.publish(SOCKET_EVENTS.BOM_UPDATED, {
      referenceId: record.id,
      referenceNumber: record.bomNo,
      referenceType: "bom",
      bomNo: record.bomNo,
      userId: req.user?.id,
      actorContext
    });

    res.json({ success: true, data: record });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('BOM record not found');
    }
    
    throw err;
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await BomModel.deleteBomCreation(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('BOM record not found');
    }
    
    throw err;
  }
};
