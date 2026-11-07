const fs = require('fs');
const path = require('path');
const p = path.join('d:', 'velson_dont_delete', 'velson_back', 'src', 'controllers', 'bomCreationController.js');
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  /export const remove = async \\(req, res\\) => \\{[\s\S]*?\};\r?\n?/,
  \export const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const force = req.query.force === 'true';

    const bom = await req.db.bomCreation.findUnique({ where: { id } });
    if (!bom) throw new NotFoundError('BOM record not found');

    const serviceJobNo = bom.serviceJobNo;

    const serviceDetailsCount = await req.db.serviceDetail.count({ where: { serviceJobNo } });

    const deps = [];
    if (serviceDetailsCount > 0) deps.push(\\\Service Details (\\\)\\\);

    if (deps.length > 0 && !force) {
       return res.status(409).json({
          success: false,
          requiresConfirmation: true,
          dependencies: deps,
          message: \\\This BOM is referred in other windows: \\\.\\\
       });
    }

    if (force) {
      await req.db.serviceDetail.deleteMany({ where: { serviceJobNo } });
    }

    await BomModel.deleteBomCreation(req.db, id);
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      throw new NotFoundError('BOM record not found');
    }
    throw err;
  }
};
\
);

fs.writeFileSync(p, content);
console.log('Modified bomCreationController.js successfully');
