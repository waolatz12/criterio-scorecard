<div align="center">

```
 ██████╗██████╗ ██╗████████╗███████╗██████╗ ██╗ ██████╗
██╔════╝██╔══██╗██║╚══██╔══╝██╔════╝██╔══██╗██║██╔═══██╗
██║     ██████╔╝██║   ██║   █████╗  ██████╔╝██║██║   ██║
██║     ██╔══██╗██║   ██║   ██╔══╝  ██╔══██╗██║██║   ██║
╚██████╗██║  ██║██║   ██║   ███████╗██║  ██║██║╚██████╔╝
 ╚═════╝╚═╝  ╚═╝╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝ ╚═════╝
```

**Supplier Performance Intelligence for Modern Supply Chains**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-blue.svg)](https://postgresql.org)
[![Status](https://img.shields.io/badge/Status-In%20Development-orange.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Overview](#-overview) · [Features](#-features) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [API Docs](#-api-reference) · [Roadmap](#-roadmap)

</div>

---

## 🧭 Overview

**Criterio** is an open-source, multi-tenant SaaS platform for supplier performance management — built for procurement teams, supply chain leaders, and operations managers in the logistics and manufacturing industries.

Most companies manage supplier performance through spreadsheets, email threads, and gut feel. Criterio replaces that with a structured, automated, data-driven system that measures, scores, benchmarks, and alerts on supplier performance — across every reporting period, every KPI, and every vendor in your portfolio.

> *79% of companies have no real-time supplier visibility. 67% of supply chain disruptions are supplier-caused. Criterio exists to fix both of those numbers.*

### What Criterio Does

- Calculates **weighted supplier scores (0–100)** across configurable KPIs — delivery, quality, cost, responsiveness, and custom metrics
- **Classifies suppliers by risk tier** — Strategic Partner, Stable Performer, At Risk, or Critical Concern
- **Fires automated alerts** when performance drops, thresholds are breached, or risk classifications change
- **Pulls data from third-party systems** — freight forwarders, ERPs, TMS platforms — via a pluggable provider integration layer
- **Generates PDF scorecards and dashboards** ready for board presentations and supplier review meetings
- Runs on a **multi-tenant architecture** — every organization gets full data isolation, custom scoring configs, and their own role-based access

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏢 **Multi-Tenancy** | Full org isolation. Each company gets their own scoring configs, suppliers, and data environment |
| ⚖️ **Weighted Scoring Engine** | Configurable KPI weights. Scores run as background jobs via BullMQ |
| 📊 **Versioned Scoring Configs** | Weight changes create a new config version — historical scores stay comparable |
| 📁 **Flexible Data Ingestion** | Manual entry, CSV bulk upload, or automated API pull from third-party integrations |
| 🔌 **Integration Framework** | Pluggable provider pattern (Flexport, SAP, Oracle SCM, custom REST APIs) |
| 🚨 **Automated Alerts** | Performance drop detection, threshold breach alerts, risk reclassification triggers |
| 📄 **PDF Report Generation** | Auto-generated executive scorecards and portfolio reports |
| 🔒 **RBAC** | Role-based access: `admin`, `analyst`, `viewer`, `supplier_manager` |
| 🕵️ **Full Audit Trail** | Every data change, scoring run, and scorecard review is logged |
| 🧩 **Custom KPIs** | Add industry-specific metrics (e.g. cold chain integrity, CO₂ per shipment) via JSONB |

---

## 🏗️ Architecture

Criterio is a Node.js REST API backed by PostgreSQL, with background job processing via BullMQ (Redis). It follows a **module-per-domain** structure — each feature area is a self-contained module with its own routes, controller, service, and validation schema.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT / DASHBOARD                       │
└─────────────────────────────────┬───────────────────────────────┘
                                  │  HTTPS
┌─────────────────────────────────▼───────────────────────────────┐
│                     EXPRESS REST API (Node.js)                  │
│  Auth · Orgs · Suppliers · Performance · Scoring · Reports      │
│  Integrations · Alerts · Scorecards · Audit                     │
└──────────┬──────────────────────────────────────┬───────────────┘
           │                                      │
┌──────────▼──────────┐                ┌──────────▼──────────────┐
│   PostgreSQL 15+    │                │   BullMQ (Redis)        │
│                     │                │                         │
│  organizations      │                │  scoring-queue          │
│  suppliers          │                │  sync-queue             │
│  scoring_configs    │                │  alert-queue            │
│  performance_kpis   │                │  report-queue           │
│  scorecards         │                │                         │
│  api_integrations   │                └──────────┬──────────────┘
│  audit_logs         │                           │
└─────────────────────┘              ┌────────────▼────────────┐
                                     │   Integration Providers  │
                                     │  Flexport · SAP · Oracle │
                                     │  Custom REST APIs        │
                                     └─────────────────────────┘
```

### Project Structure

```
criterio/
├── src/
│   ├── config/              # DB, Redis, logger, env validation
│   ├── middleware/          # Auth, RBAC, validation, rate limiting, error handling
│   ├── modules/
│   │   ├── auth/            # JWT authentication & refresh tokens
│   │   ├── organizations/   # Tenant management & scoring config
│   │   ├── suppliers/       # Supplier CRUD, CSV import, categorization
│   │   ├── performance/     # KPI data submission & validation
│   │   ├── scoring/         # Scoring engine, normalizer, weighted formula
│   │   ├── scorecards/      # Scorecard lifecycle, PDF generation
│   │   ├── integrations/    # Third-party API provider framework
│   │   │   └── providers/   # flexport.js · sap.js · base.js
│   │   ├── alerts/          # Risk classification & alert engine
│   │   └── reports/         # Dashboard data & report generation
│   ├── jobs/
│   │   ├── workers/         # scoringWorker · syncWorker · alertWorker · reportWorker
│   │   └── schedulers/      # Cron jobs for periodic syncs
│   ├── db/
│   │   ├── migrations/      # SQL schema migrations
│   │   ├── seeds/           # Dev/test seed data
│   │   └── repositories/    # Data access layer (per domain)
│   └── utils/               # AppError · asyncHandler · encryption · pagination
├── tests/
│   ├── unit/
│   └── integration/
├── docker-compose.yml
└── .env.example
```

---

## ⚙️ Scoring Engine

Criterio's scoring engine applies a configurable **weighted formula** to normalize and combine raw KPI values into a single supplier score per reporting period:

```
Final Score = (W₁ × Delivery Score) + (W₂ × Quality Score) + (W₃ × Cost Score) + (W₄ × Responsiveness Score) + ...
```

Where:
- All weights (`Wₙ`) are set per organization and must sum to 100%
- Raw values are normalized to a **0–100 scale** before weighting
- For inverse KPIs (e.g. defect rate, cost variance), normalization is inverted — lower raw value = higher normalized score
- Scores are benchmarked against the **org average** for that period
- Each run snapshots the scoring config version used — historical scores remain reproducible

### Grade Bands

| Grade | Score Range | Classification |
|---|---|---|
| A | 85 – 100 | Strategic Partner |
| B | 70 – 84 | Stable Performer |
| C | 50 – 69 | At Risk |
| D | 0 – 49 | Critical Concern |

> Grade bands and risk thresholds are configurable per organization and per supplier category.

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (recommended)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/criterio.git
cd criterio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and secrets:

```env
# App
NODE_ENV=development
PORT=3000

# PostgreSQL
DATABASE_URL=postgresql://criterio:password@localhost:5432/criterio_db

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Encryption (for API integration credentials)
ENCRYPTION_KEY=32-character-aes-256-key-here!!

# Logging
LOG_LEVEL=info
```

### 4. Start with Docker Compose (recommended)

```bash
docker-compose up -d
```

This starts PostgreSQL, Redis, and the API server together.

### 5. Run database migrations

```bash
npm run db:migrate
```

### 6. (Optional) Seed development data

```bash
npm run db:seed
```

### 7. Start the development server

```bash
npm run dev
```

The API will be live at `http://localhost:3000/api/v1`.

---

## 🔌 Third-Party Integrations

Criterio uses a **provider pattern** for third-party integrations. Every integration extends `BaseProvider` and implements two methods:

```js
class FlexportProvider extends BaseProvider {
  async authenticate() { ... }
  async fetchPerformanceData(supplierId, period) { ... }
}
```

Field mappings between the provider's data schema and Criterio's KPI keys are stored per integration in the database — no code changes needed to adjust mappings.

### Currently Supported Providers

| Provider | Type | Status |
|---|---|---|
| Flexport | Freight Forwarder | 🚧 In Progress |
| SAP S/4HANA | ERP | 🚧 In Progress |
| Oracle SCM Cloud | ERP / SCM | 📋 Planned |
| Generic REST | Custom APIs | ✅ Available |

To add a new provider, create a file in `src/modules/integrations/providers/` that extends `BaseProvider`.

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1`. Authentication uses JWT Bearer tokens.

### Authentication

```
POST   /api/v1/auth/register         Register a new organization + admin user
POST   /api/v1/auth/login            Login and receive access + refresh tokens
POST   /api/v1/auth/refresh          Refresh access token
POST   /api/v1/auth/logout           Revoke refresh token
```

### Suppliers

```
GET    /api/v1/suppliers             List all suppliers (paginated, filterable)
POST   /api/v1/suppliers             Create a supplier
GET    /api/v1/suppliers/:id         Get supplier by ID
PATCH  /api/v1/suppliers/:id         Update supplier
DELETE /api/v1/suppliers/:id         Deactivate supplier
POST   /api/v1/suppliers/import      Bulk import via CSV
```

### Performance Data

```
POST   /api/v1/performance/submit    Submit KPI data for a supplier + period
GET    /api/v1/performance/:id       Get submission by ID
PATCH  /api/v1/performance/:id       Correct a submission
```

### Scoring

```
POST   /api/v1/scoring/run           Trigger a scoring run for a period
GET    /api/v1/scoring/runs          List scoring runs
GET    /api/v1/scoring/runs/:id      Get scoring run status and results
```

### Scorecards

```
GET    /api/v1/scorecards            List scorecards (filter by period, supplier, grade)
GET    /api/v1/scorecards/:id        Get scorecard detail
PATCH  /api/v1/scorecards/:id/review Submit review decision (approve/reject)
POST   /api/v1/scorecards/:id/publish Publish a reviewed scorecard
GET    /api/v1/scorecards/:id/pdf    Download scorecard as PDF
```

### Integrations

```
GET    /api/v1/integrations          List configured integrations
POST   /api/v1/integrations          Add a new integration
PATCH  /api/v1/integrations/:id      Update integration config
POST   /api/v1/integrations/:id/sync Trigger manual data sync
GET    /api/v1/integrations/:id/logs View sync history
```

### Alerts

```
GET    /api/v1/alerts                List alerts (filter by severity, supplier)
PATCH  /api/v1/alerts/:id/acknowledge Acknowledge an alert
```

Full API documentation available at `/api/v1/docs` when running in development mode (Swagger UI).

---

## 🗄️ Database Schema

Criterio uses **PostgreSQL** with the following core tables:

```
organizations          → Tenants / companies
users                  → Auth and RBAC
scoring_configs        → Versioned KPI weight configurations
scoring_criteria       → Individual KPIs per config
suppliers              → Supplier profiles and categorization
reporting_periods      → Monthly / quarterly evaluation windows
performance_submissions → Raw submitted KPI data per supplier per period
performance_kpis       → Normalized KPI values post-validation
scoring_runs           → Background job execution records
scorecards             → Final scored output per supplier per period
scorecard_alerts       → Risk alerts generated by the scoring engine
api_integrations       → Third-party integration configs (credentials encrypted)
integration_sync_logs  → Sync history and error logs per integration
audit_logs             → Full change history across all entities
notifications          → In-app notification queue
```

See [`/src/db/migrations/`](src/db/migrations) for full schema definitions.

---

## 🧪 Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests (requires running PostgreSQL + Redis)
npm run test:integration

# All tests with coverage report
npm run test:coverage
```

---

## 🛠️ Development Scripts

```bash
npm run dev           # Start server with hot reload (nodemon)
npm run build         # Compile for production
npm start             # Run production build
npm run db:migrate    # Run pending migrations
npm run db:rollback   # Rollback last migration
npm run db:seed       # Seed development data
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix lint errors
npm run test          # Run all tests
```

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js |
| **Database** | PostgreSQL 15 |
| **Query Builder** | Knex.js |
| **Job Queue** | BullMQ + Redis |
| **Authentication** | JSON Web Tokens (JWT) |
| **Validation** | Joi |
| **PDF Generation** | PDFKit |
| **CSV Parsing** | Papa Parse |
| **Logging** | Winston |
| **Security** | Helmet, express-rate-limit, AES-256 credential encryption |
| **Testing** | Jest + Supertest |
| **Containerization** | Docker + Docker Compose |

---

## 🗺️ Roadmap

### v0.1 — Foundation *(Current)*
- [x] Project scaffold and database schema
- [x] Multi-tenant auth (JWT + RBAC)
- [x] Supplier CRUD + CSV import
- [ ] Performance data submission + validation
- [ ] Core scoring engine (weighted formula + normalization)
- [ ] Basic scorecard generation

### v0.2 — Intelligence Layer
- [ ] Automated risk classification engine
- [ ] Alert system (performance drops, threshold breaches)
- [ ] Scoring config versioning
- [ ] Reporting period management

### v0.3 — Integrations
- [ ] Integration provider framework (`BaseProvider`)
- [ ] Flexport connector
- [ ] SAP connector
- [ ] Generic REST API connector

### v0.4 — Reports & Exports
- [ ] PDF scorecard generation
- [ ] Portfolio dashboard data API
- [ ] Period comparison reports
- [ ] Supplier ranking exports

### v1.0 — Production Ready
- [ ] Oracle SCM connector
- [ ] Webhook support
- [ ] Score dispute / correction workflow
- [ ] Audit log exports
- [ ] Rate limiting and usage analytics per tenant

---

## 🤝 Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 🔐 Security

Criterio stores third-party API credentials encrypted at rest using AES-256 before they are written to the database. JWT secrets, encryption keys, and database credentials must never be committed to source control.

If you discover a security vulnerability, please report it privately to `security@criterio.io` rather than opening a public issue.

---

## 📄 License

[MIT License](LICENSE) — © 2025 Criterio

---

<div align="center">

Built for procurement teams who are done with spreadsheets.

**[criterio.io](https://criterio.io)** · [Documentation](https://docs.criterio.io) · [Report a Bug](https://github.com/your-org/criterio/issues)

</div>