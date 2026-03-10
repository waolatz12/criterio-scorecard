const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { kpiConfigSchema } = require('../validators/organizations.validator');

// Create custom KPI configuration
router.post('/config', authenticate, validate(kpiConfigSchema), async (req, res) => {
  const kpisService = require('../services/kpis.service');
  const template = await kpisService.createCustomConfig(
    req.user.organization_id,
    req.user.id,
    req.body
  );
  res.status(201).json({ success: true, template });
});

// Get KPI templates for organization
router.get('/templates', authenticate, async (req, res) => {
  const kpiRepo = require('../repositories/kpi.repository');
  const templates = await kpiRepo.findByOrgAndSupplierType(
    req.user.organization_id,
    req.query.supplier_type
  );
  const categories = templates ? await kpiRepo.findCategoriesByTemplateId(templates.id) : [];
  res.json({ success: true, template: templates, categories });
});

module.exports = router;
