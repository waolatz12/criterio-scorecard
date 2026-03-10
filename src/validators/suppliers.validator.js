const { z } = require('zod');

const supplierTierEnum = z.enum(['Critical', 'Strategic', 'Non-Critical']);

const createSupplier = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  supplier_type: z.string().optional(),
  country_code: z.string().length(2, 'Country code must be 2 characters').optional(),
  region: z.string().optional(),
  contact_email: z.string().email('Invalid email format').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  tax_id: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  tier: supplierTierEnum.optional(),
  onboarded_at: z.string().datetime().optional().or(z.literal('')),
  contract_expiry: z.string().datetime().optional().or(z.literal('')),
  metadata: z.record(z.any()).optional(),
});

const updateSupplier = createSupplier.partial();

const bulkImport = z.object({
  suppliers: z.array(createSupplier),
  import_type: z.enum(['csv', 'api_sync']).default('csv'),
  source: z.string().optional(),
});

const csvImport = z.object({
  file: z.any(), // Will be handled by multer
});

module.exports = {
  createSupplier,
  updateSupplier,
  bulkImport,
  csvImport
};
