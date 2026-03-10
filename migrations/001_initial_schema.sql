-- enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2.1 organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  subscription_tier VARCHAR(50),
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 2.2 users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 2.3 suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  supplier_type VARCHAR(50) NOT NULL,
  country_code CHAR(2),
  region VARCHAR(100),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  tax_id VARCHAR(100),
  status VARCHAR(30) DEFAULT 'active',
  tier VARCHAR(20),
  onboarded_at DATE,
  contract_expiry DATE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 2.4 scorecard_templates
CREATE TABLE scorecard_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  supplier_type VARCHAR(50),
  scoring_scale INTEGER DEFAULT 100,
  passing_threshold NUMERIC(5,2),
  is_default BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 2.5 kpi_categories
CREATE TABLE kpi_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES scorecard_templates(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  weight_pct NUMERIC(5,2) NOT NULL,
  description TEXT,
  measurement_method VARCHAR(50),
  data_source VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 supplier_scorecards
CREATE TABLE supplier_scorecards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  template_id UUID REFERENCES scorecard_templates(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type VARCHAR(20) NOT NULL,
  overall_score NUMERIC(5,2),
  status VARCHAR(30) DEFAULT 'draft',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  comments TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 2.7 scorecard_kpi_scores
CREATE TABLE scorecard_kpi_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scorecard_id UUID REFERENCES supplier_scorecards(id) ON DELETE CASCADE,
  kpi_category_id UUID REFERENCES kpi_categories(id),
  raw_value NUMERIC(10,4),
  target_value NUMERIC(10,4),
  score NUMERIC(5,2),
  weighted_score NUMERIC(5,2),
  data_points_count INTEGER,
  source VARCHAR(50),
  source_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 api_integrations
CREATE TABLE api_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  integration_type VARCHAR(50) NOT NULL,
  base_url VARCHAR(500),
  auth_type VARCHAR(30) NOT NULL,
  credentials JSONB,
  config JSONB,
  webhook_secret VARCHAR(255),
  status VARCHAR(30) DEFAULT 'active',
  last_synced_at TIMESTAMPTZ,
  last_error TEXT,
  sync_frequency VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 2.9 api_integration_logs
CREATE TABLE api_integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES api_integrations(id) ON DELETE CASCADE,
  direction VARCHAR(10) NOT NULL,
  method VARCHAR(10),
  endpoint TEXT,
  request_headers JSONB,
  request_body JSONB,
  response_status INTEGER,
  response_body JSONB,
  duration_ms INTEGER,
  success BOOLEAN,
  error_message TEXT,
  correlation_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.10 shipments
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id),
  integration_id UUID REFERENCES api_integrations(id),
  external_id VARCHAR(255),
  mode VARCHAR(30) NOT NULL,
  incoterm VARCHAR(10),
  origin_country CHAR(2),
  destination_country CHAR(2),
  origin_port VARCHAR(100),
  destination_port VARCHAR(100),
  scheduled_pickup TIMESTAMPTZ,
  actual_pickup TIMESTAMPTZ,
  scheduled_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  on_time BOOLEAN,
  quoted_cost NUMERIC(12,2),
  actual_cost NUMERIC(12,2),
  currency CHAR(3) DEFAULT 'USD',
  weight_kg NUMERIC(10,2),
  volume_cbm NUMERIC(10,3),
  status VARCHAR(30) NOT NULL,
  exception_code VARCHAR(50),
  claim_filed BOOLEAN DEFAULT FALSE,
  claim_amount NUMERIC(12,2),
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 2.11 shipment_events
CREATE TABLE shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  event_code VARCHAR(50) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  event_timestamp TIMESTAMPTZ NOT NULL,
  source VARCHAR(50),
  raw_event JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.12 supplier_documents
CREATE TABLE supplier_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100),
  file_size_bytes INTEGER,
  issue_date DATE,
  expiry_date DATE,
  status VARCHAR(30) DEFAULT 'active',
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.13 audit_logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.14 notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  channels VARCHAR[],
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.1 Indexes
CREATE INDEX idx_suppliers_org ON suppliers(organization_id, status);
CREATE INDEX idx_suppliers_type ON suppliers(organization_id, supplier_type);

CREATE INDEX idx_scorecards_supplier ON supplier_scorecards(supplier_id, period_start DESC);
CREATE INDEX idx_scorecards_status ON supplier_scorecards(status, organization_id);

CREATE INDEX idx_shipments_supplier ON shipments(supplier_id, scheduled_delivery DESC);
CREATE INDEX idx_shipments_status ON shipments(organization_id, status, mode);
CREATE INDEX idx_shipments_ontime ON shipments(supplier_id, on_time, actual_delivery);

CREATE INDEX idx_api_logs_integration ON api_integration_logs(integration_id, created_at DESC);

CREATE INDEX idx_docs_expiry ON supplier_documents(expiry_date, status);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id, created_at DESC);

-- 3.2 Materialized View
CREATE MATERIALIZED VIEW mv_supplier_performance AS
SELECT
  s.id AS supplier_id,
  s.name AS supplier_name,
  s.supplier_type,
  s.organization_id,
  COUNT(sc.id) AS total_scorecards,
  ROUND(AVG(sc.overall_score), 2) AS avg_score,
  MAX(sc.overall_score) AS best_score,
  MIN(sc.overall_score) AS worst_score,
  COUNT(sh.id) AS total_shipments,
  ROUND(AVG(CASE WHEN sh.on_time THEN 100 ELSE 0 END), 2) AS on_time_pct,
  ROUND(AVG((sh.actual_cost - sh.quoted_cost) / NULLIF(sh.quoted_cost,0) * 100), 2) AS cost_variance_pct
FROM suppliers s
LEFT JOIN supplier_scorecards sc ON sc.supplier_id = s.id AND sc.status = 'published'
LEFT JOIN shipments sh ON sh.supplier_id = s.id
GROUP BY s.id, s.name, s.supplier_type, s.organization_id;

-- refresh view call: SELECT refresh_materialized_view('mv_supplier_performance');
