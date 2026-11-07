import { dockerPrisma } from '../config/db.js';

export const getStockLiabilityLedger = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(200, Math.max(10, parseInt(req.query.limit, 10) || 50));
    const offset = (page - 1) * limit;

    const { search, vourtype, partNo, barcode, fromDate, toDate } = req.query;

    const conditions = [];

    if (search && search.trim()) {
      const term = search.trim().replace(/'/g, "''");
      const isNum = /^\d+$/.test(term);
      if (isNum) {
        conditions.push(`(s.part_no ILIKE '%${term}%' OR s.voucher_no ILIKE '%${term}%' OR s.barcode ILIKE '%${term}%' OR s.created_by ILIKE '%${term}%' OR s.id = ${term} OR s.order_no = ${term} OR s.voucher_ref_no = ${term} OR s.source_item_id = ${term} OR im."partName" ILIKE '%${term}%')`);
      } else {
        conditions.push(`(s.part_no ILIKE '%${term}%' OR s.voucher_no ILIKE '%${term}%' OR s.barcode ILIKE '%${term}%' OR s.created_by ILIKE '%${term}%' OR im."partName" ILIKE '%${term}%')`);
      }
    }

    if (partNo && partNo.trim()) {
      const p = partNo.trim().replace(/'/g, "''");
      conditions.push(`s.part_no ILIKE '%${p}%'`);
    }

    if (vourtype && vourtype.trim() && vourtype !== 'ALL') {
      const v = vourtype.trim().replace(/'/g, "''");
      if (v.toUpperCase() === 'STOCK INWARD') {
        conditions.push(`(s.vourtype ILIKE 'Stock Inward' OR s.voucher_type ILIKE 'Stock Inward')`);
      } else if (v.toUpperCase() === 'GRN ENTRY') {
        conditions.push(`(s.vourtype ILIKE 'GRN Entry' OR s.voucher_type ILIKE 'GRN Entry')`);
      } else if (v.toUpperCase() === 'MATERIAL OUTWARD') {
        conditions.push(`(s.vourtype ILIKE 'Material Outward' OR s.voucher_type ILIKE 'Material Outward')`);
      } else {
        conditions.push(`(s.vourtype = '${v}' OR s.voucher_type = '${v}')`);
      }
    }

    if (barcode && barcode.trim()) {
      const b = barcode.trim().replace(/'/g, "''");
      conditions.push(`s.barcode ILIKE '%${b}%'`);
    }

    if (fromDate && fromDate.trim()) {
      conditions.push(`s.voucher_date >= '${fromDate.trim()}'::timestamp`);
    }

    if (toDate && toDate.trim()) {
      conditions.push(`s.voucher_date <= '${toDate.trim()}'::timestamp`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Fast count & totals: when filters are applied, compute exact count and inward/outward sums
    let totalRows = 851203;
    let totalInwardQty = 0;
    let totalOutwardQty = 0;
    if (whereClause) {
      const countQuery = `
        SELECT 
          COUNT(*) as total,
          COALESCE(SUM(s.inward_qty), 0) as total_inward,
          COALESCE(SUM(s.outward_qty), 0) as total_outward
        FROM stock_liability_1 s
        LEFT JOIN item_master im ON s.item_id = im.id
        ${whereClause};
      `;
      const countResult = await dockerPrisma.$queryRawUnsafe(countQuery);
      totalRows = Number(countResult[0]?.total || 0);
      totalInwardQty = Number(countResult[0]?.total_inward || 0);
      totalOutwardQty = Number(countResult[0]?.total_outward || 0);
    }

    const dataQuery = `
      SELECT 
        s.id,
        s.voucher_type,
        s.vourtype,
        s.voucher_ref_no,
        s.order_no,
        s.voucher_no,
        s.voucher_date,
        s.item_id,
        s.source_item_id,
        s.part_no,
        im."partName",
        s.inward_qty,
        s.outward_qty,
        s.rate,
        s.amount,
        s.credit_amt,
        s.debit_amt,
        s.created_by,
        s.created_date,
        s.status,
        s.statues,
        s.barcode,
        s.reserve_in,
        s.reserve_out,
        s.vendor_in,
        s.vendor_out,
        s.transfer_qty,
        s.ledger_id,
        s.old_qty,
        s.edited_by,
        s.edited_date,
        s.return_qty,
        s.return_by,
        s.return_date,
        s.is_item_matched,
        s.unmatched_reason
      FROM stock_liability_1 s
      LEFT JOIN item_master im ON s.item_id = im.id
      ${whereClause}
      ORDER BY s.id DESC
      LIMIT ${limit} OFFSET ${offset};
    `;

    const data = await dockerPrisma.$queryRawUnsafe(dataQuery);

    const formattedData = data.map(row => ({
      ...row,
      id: Number(row.id),
      order_no: row.order_no !== null ? Number(row.order_no) : null,
      voucher_ref_no: row.voucher_ref_no !== null ? Number(row.voucher_ref_no) : null,
      ledger_id: row.ledger_id !== null ? Number(row.ledger_id) : null,
      item_id: row.item_id !== null ? Number(row.item_id) : null,
      source_item_id: row.source_item_id !== null ? Number(row.source_item_id) : null,
      inward_qty: Number(row.inward_qty || 0),
      outward_qty: Number(row.outward_qty || 0),
      rate: Number(row.rate || 0),
      amount: Number(row.amount || 0),
      credit_amt: Number(row.credit_amt || 0),
      debit_amt: Number(row.debit_amt || 0),
      reserve_in: Number(row.reserve_in || 0),
      reserve_out: Number(row.reserve_out || 0),
      vendor_in: Number(row.vendor_in || 0),
      vendor_out: Number(row.vendor_out || 0),
      transfer_qty: Number(row.transfer_qty || 0),
      old_qty: Number(row.old_qty || 0),
      return_qty: Number(row.return_qty || 0)
    }));

    res.json({
      success: true,
      data: formattedData,
      pagination: {
        totalRows,
        page,
        limit,
        totalPages: Math.ceil(totalRows / limit) || 1,
        totalInwardQty,
        totalOutwardQty
      }
    });

  } catch (err) {
    console.error("Error fetching stock liability ledger:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stock liability records",
      error: err.message
    });
  }
};

export const getVoucherTypes = async (req, res) => {
  try {
    const types = await dockerPrisma.$queryRawUnsafe(`
      SELECT vourtype, COUNT(*) as cnt 
      FROM stock_liability_1 
      GROUP BY vourtype 
      ORDER BY cnt DESC;
    `);
    res.json({
      success: true,
      data: types.map(t => ({ vourtype: t.vourtype, count: Number(t.cnt) }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
