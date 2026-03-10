const organizationsRepo = require('../repositories/organizations.repository');
const kpiRepo = require('../repositories/kpi.repository');
const logger = require('../config/logger');

class KPIConfigService {
  // Default KPI templates by industry/supplier type
  getDefaultKPIs(industry, supplierType) {
    const defaults = {
      manufacturing: {
        shipper: [
          { name: 'On-Time Delivery', code: 'ON_TIME_DELIVERY', weight_pct: 30 },
          { name: 'Quality Compliance', code: 'QUALITY_COMPLIANCE', weight_pct: 25 },
          { name: 'Cost Accuracy', code: 'COST_ACCURACY', weight_pct: 20 },
          { name: 'Documentation', code: 'DOCUMENTATION', weight_pct: 15 },
          { name: 'Communication', code: 'COMMUNICATION', weight_pct: 10 },
        ],
        freight_forwarder: [
          { name: 'On-Time Delivery', code: 'ON_TIME_DELIVERY', weight_pct: 35 },
          { name: 'Cost Accuracy', code: 'COST_ACCURACY', weight_pct: 25 },
          { name: 'Documentation', code: 'DOCUMENTATION', weight_pct: 20 },
          { name: 'Problem Resolution', code: 'PROBLEM_RESOLUTION', weight_pct: 15 },
          { name: 'Communication', code: 'COMMUNICATION', weight_pct: 5 },
        ],
      },
      logistics: {
        carrier: [
          { name: 'On-Time Delivery', code: 'ON_TIME_DELIVERY', weight_pct: 40 },
          { name: 'Damage Rate', code: 'DAMAGE_RATE', weight_pct: 25 },
          { name: 'Cost Accuracy', code: 'COST_ACCURACY', weight_pct: 20 },
          { name: 'Claims Handling', code: 'CLAIMS_HANDLING', weight_pct: 10 },
          { name: 'Safety', code: 'SAFETY', weight_pct: 5 },
        ],
        '3pl': [
          { name: 'On-Time Delivery', code: 'ON_TIME_DELIVERY', weight_pct: 35 },
          { name: 'Inventory Accuracy', code: 'INVENTORY_ACCURACY', weight_pct: 30 },
          { name: 'Cost Efficiency', code: 'COST_EFFICIENCY', weight_pct: 20 },
          { name: 'Service Quality', code: 'SERVICE_QUALITY', weight_pct: 10 },
          { name: 'Systems Integration', code: 'SYSTEMS_INTEGRATION', weight_pct: 5 },
        ],
      },
      pharma: {
        shipper: [
          { name: 'Quality Compliance', code: 'QUALITY_COMPLIANCE', weight_pct: 50 },
          { name: 'Temperature Control', code: 'TEMP_CONTROL', weight_pct: 20 },
          { name: 'Documentation', code: 'DOCUMENTATION', weight_pct: 15 },
          { name: 'Traceability', code: 'TRACEABILITY', weight_pct: 10 },
          { name: 'Communication', code: 'COMMUNICATION', weight_pct: 5 },
        ],
      },
      retail: {
        shipper: [
          { name: 'On-Time Delivery', code: 'ON_TIME_DELIVERY', weight_pct: 40 },
          { name: 'Cost Accuracy', code: 'COST_ACCURACY', weight_pct: 30 },
          { name: 'Fill Rate', code: 'FILL_RATE', weight_pct: 15 },
          { name: 'Damage Rate', code: 'DAMAGE_RATE', weight_pct: 10 },
          { name: 'Communication', code: 'COMMUNICATION', weight_pct: 5 },
        ],
      },
    };

    const key = (defaults[industry] && supplierType in defaults[industry])
      ? industry
      : 'retail';

    return defaults[key][supplierType] || defaults.retail.shipper;
  }

  async createDefaultConfig(organizationId, userId, industry, supplierType) {
    const defaultKPIs = this.getDefaultKPIs(industry, supplierType);

    // create template
    const template = await kpiRepo.create({
      organization_id: organizationId,
      name: `Default ${supplierType} Scorecard (v1)`,
      supplier_type: supplierType,
      scoring_scale: 100,
      passing_threshold: 70,
      is_default: true,
      created_by: userId,
    });
    logger.info(`Created default KPI template: ${template.id}`);

    // create KPI categories
    for (let i = 0; i < defaultKPIs.length; i++) {
      const kpi = defaultKPIs[i];
      await kpiRepo.createKPICategory({
        template_id: template.id,
        name: kpi.name,
        code: kpi.code,
        weight_pct: kpi.weight_pct,
        measurement_method: 'hybrid',
        data_source: 'shipment_data',
        sort_order: i,
      });
    }

    logger.info(`Created ${defaultKPIs.length} KPI categories for template ${template.id}`);
    return template;
  }

  async createCustomConfig(organizationId, userId, data) {
    // validate weights sum to 100
    const totalWeight = data.kpis.reduce((sum, k) => sum + k.weight_pct, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw { status: 400, message: `KPI weights must sum to 100% (current: ${totalWeight}%)` };
    }

    // create versioned template
    const template = await kpiRepo.create({
      organization_id: organizationId,
      name: data.template_name,
      supplier_type: data.supplier_type,
      scoring_scale: data.scoring_scale,
      passing_threshold: data.passing_threshold,
      is_default: false,
      created_by: userId,
    });
    logger.info(`Created custom KPI template: ${template.id}`);

    // create categories
    for (let i = 0; i < data.kpis.length; i++) {
      const kpi = data.kpis[i];
      await kpiRepo.createKPICategory({
        template_id: template.id,
        name: kpi.name,
        code: kpi.code,
        weight_pct: kpi.weight_pct,
        description: kpi.description,
        measurement_method: kpi.measurement_method,
        data_source: kpi.data_source,
        sort_order: i,
      });
    }

    logger.info(`Created ${data.kpis.length} KPI categories for template ${template.id}`);
    return template;
  }
}

module.exports = new KPIConfigService();
