const { z } = require('zod');

const organizationSignupSchema = z.object({
  body: z.object({
    company_name: z.string().min(2, 'Company name required').nonempty(),
    email: z.string().email('Invalid email').nonempty('Email is required'),
    password: z.string().min(8, 'Password must be at least 8 chars').nonempty(),
    industry: z.enum(['manufacturing', 'logistics', 'retail', 'pharma', 'other']),
    company_size: z.enum(['small', 'medium', 'large', 'enterprise']),
    procurement_focus: z.string().min(2, 'Procurement focus required').nonempty(),
  }),
});

//bb
const kpiConfigSchema = z.object({
  body: z.object({
    template_name: z.string().min(2, 'Template name required').nonempty(),
    supplier_type: z.enum(['shipper', 'freight_forwarder', 'carrier', '3pl', 'customs_broker']),
    scoring_scale: z.number().default(100),
    passing_threshold: z.number().min(0).max(100).optional(),
    kpis: z.array(
      z.object({
        name: z.string().min(2, 'KPI name required'),
        code: z.string().min(2, 'KPI code required'),
        weight_pct: z.number().min(0).max(100),
        description: z.string().optional(),
        measurement_method: z.enum(['automated', 'manual', 'hybrid']).default('manual'),
        data_source: z.enum(['api_integration', 'manual_entry', 'shipment_data']).default('manual_entry'),
      })
    ).min(1, 'At least 1 KPI required'),
  }),
});

const emailVerificationSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Verification token required'),
  }),
});

module.exports = {
  organizationSignupSchema,
  kpiConfigSchema,
  emailVerificationSchema,
};
