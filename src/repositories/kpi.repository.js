const db = require('../config/database');

class KPIConfigRepository {
  async create(data) {
    const { rows } = await db.query(
      `INSERT INTO scorecard_templates
       (organization_id, name, supplier_type, scoring_scale, passing_threshold, is_default, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [
        data.organization_id,
        data.name,
        data.supplier_type,
        data.scoring_scale || 100,
        data.passing_threshold,
        data.is_default || false,
        data.created_by,
      ]
    );
    return rows[0];
  }

  async createKPICategory(data) {
    const { rows } = await db.query(
      `INSERT INTO kpi_categories
       (template_id, name, code, weight_pct, description, measurement_method, data_source, sort_order, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [
        data.template_id,
        data.name,
        data.code,
        data.weight_pct,
        data.description,
        data.measurement_method,
        data.data_source,
        data.sort_order || 0,
      ]
    );
    return rows[0];
  }

  async findTemplateById(id) {
    const { rows } = await db.query(
      `SELECT * FROM scorecard_templates WHERE id = $1`,
      [id]
    );
    return rows[0];
  }

  async findCategoriesByTemplateId(templateId) {
    const { rows } = await db.query(
      `SELECT * FROM kpi_categories WHERE template_id = $1 ORDER BY sort_order`,
      [templateId]
    );
    return rows;
  }

  async findByOrgAndSupplierType(organizationId, supplierType) {
    const { rows } = await db.query(
      `SELECT * FROM scorecard_templates
       WHERE organization_id = $1 AND (supplier_type = $2 OR is_default = true)
       ORDER BY is_default DESC, created_at DESC
       LIMIT 1`,
      [organizationId, supplierType]
    );
    return rows[0];
  }
}

module.exports = new KPIConfigRepository();
