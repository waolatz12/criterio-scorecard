-- 2.10 import_batches
CREATE TABLE import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  import_type VARCHAR(50) NOT NULL, -- 'csv', 'api_sync'
  source VARCHAR(100), -- filename for csv, integration name for api
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  successful_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  status VARCHAR(30) DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  error_log JSONB, -- array of error objects with row_number, error_message, row_data
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 2.11 import_batch_items (optional, for detailed tracking)
CREATE TABLE import_batch_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES import_batches(id) ON DELETE CASCADE,
  row_number INTEGER,
  supplier_data JSONB,
  status VARCHAR(30), -- 'success', 'failed', 'skipped'
  error_message TEXT,
  created_supplier_id UUID REFERENCES suppliers(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);