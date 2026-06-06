import * as JobCardModel from '../models/jobCardModel.js';

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
    console.error('[jobCard] getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getNextNo = async (req, res) => {
  try {
    const jobNo = await JobCardModel.getNextJobNo(req.db);
    res.json({ success: true, jobNo });
  } catch (err) {
    console.error('[jobCard] getNextNo error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const {
      jobNo, model, qtyV, currentDate, priority, requiredDate, note, partImage, lineItems
    } = req.body;

    if (!jobNo) {
      return res.status(400).json({ success: false, message: 'jobNo is required' });
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
    };

    const record = await JobCardModel.createJobCard(req.db, headerData, buildDetailRows(lineItems));
    res.status(201).json({ success: true, data: mapResponse(record) });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Job number already exists' });
    }
    console.error('[jobCard] create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      model, qtyV, currentDate, priority, requiredDate, note, partImage, lineItems
    } = req.body;

    const { partImage: imgBuffer, partImageMime: imgMime } = parseBase64Image(partImage);

    const headerData = {
      model: model || null,
      qtyV: qtyV ? toFloat(qtyV) : null,
      currentDate: currentDate ? new Date(currentDate) : null,
      priority: priority || null,
      requiredDate: requiredDate ? new Date(requiredDate) : null,
      note: note || null,
      ...(partImage !== undefined && { partImage: imgBuffer, partImageMime: imgMime }),
    };

    const record = await JobCardModel.updateJobCard(req.db, id, headerData, buildDetailRows(lineItems));
    res.json({ success: true, data: mapResponse(record) });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Job Card not found' });
    }
    console.error('[jobCard] update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await JobCardModel.deleteJobCard(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Job Card not found' });
    }
    console.error('[jobCard] delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
