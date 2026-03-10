const suppliersRepo = require('../repositories/suppliers.repository');
const { v4: uuidv4 } = require('uuid');
const csv = require('csv-parser');
const fs = require('fs');

class SuppliersService {
  async list(filters) {
    let condition = 'TRUE';
    let params = [];

    if (filters.organization_id) {
      condition += ` AND organization_id = $${params.length + 1}`;
      params.push(filters.organization_id);
    }

    if (filters.tier) {
      condition += ` AND tier = $${params.length + 1}`;
      params.push(filters.tier);
    }

    if (filters.status) {
      condition += ` AND status = $${params.length + 1}`;
      params.push(filters.status);
    }

    return suppliersRepo.findAll(condition, params);
  }

  async getById(id) {
    return suppliersRepo.findById(id);
  }

  async create(data) {
    // Set default values
    if (!data.status) data.status = 'active';
    if (!data.onboarded_at) data.onboarded_at = new Date().toISOString().split('T')[0];

    return suppliersRepo.create(data);
  }

  async update(id, data) {
    return suppliersRepo.update(id, data);
  }

  async delete(id) {
    return suppliersRepo.delete(id);
  }

  async bulkImport({ suppliers, import_type, source, organization_id, created_by }) {
    // Create import batch
    const batchId = uuidv4();
    const batch = {
      id: batchId,
      organization_id,
      import_type,
      source: source || 'manual',
      total_rows: suppliers.length,
      processed_rows: 0,
      successful_rows: 0,
      failed_rows: 0,
      status: 'processing',
      error_log: [],
      created_by
    };

    await suppliersRepo.createImportBatch(batch);

    const results = {
      batch_id: batchId,
      total: suppliers.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    // Process each supplier
    for (let i = 0; i < suppliers.length; i++) {
      const supplierData = { ...suppliers[i], organization_id };

      try {
        const created = await this.create(supplierData);
        results.successful++;

        // Log successful import
        await suppliersRepo.createImportBatchItem({
          batch_id: batchId,
          row_number: i + 1,
          supplier_data: supplierData,
          status: 'success',
          created_supplier_id: created.id
        });

      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error.message,
          data: supplierData
        });

        // Log failed import
        await suppliersRepo.createImportBatchItem({
          batch_id: batchId,
          row_number: i + 1,
          supplier_data: supplierData,
          status: 'failed',
          error_message: error.message
        });
      }
    }

    // Update batch status
    await suppliersRepo.updateImportBatch(batchId, {
      processed_rows: suppliers.length,
      successful_rows: results.successful,
      failed_rows: results.failed,
      status: results.failed > 0 ? 'completed_with_errors' : 'completed',
      error_log: results.errors,
      completed_at: new Date()
    });

    return results;
  }

  async importFromCSV(filePath, organization_id, created_by) {
    return new Promise((resolve, reject) => {
      const suppliers = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // Map CSV columns to supplier fields
          const supplier = {
            name: row.name || row.Name,
            supplier_type: row.supplier_type || row['Supplier Type'],
            country_code: row.country_code || row['Country Code'],
            region: row.region || row.Region,
            contact_email: row.contact_email || row['Contact Email'],
            contact_phone: row.contact_phone || row['Contact Phone'],
            tax_id: row.tax_id || row['Tax ID'],
            tier: row.tier || row.Tier,
            onboarded_at: row.onboarded_at || row['Onboarded At'],
            contract_expiry: row.contract_expiry || row['Contract Expiry'],
            metadata: row.metadata ? JSON.parse(row.metadata) : {}
          };
          suppliers.push(supplier);
        })
        .on('end', async () => {
          try {
            const result = await this.bulkImport({
              suppliers,
              import_type: 'csv',
              source: filePath.split('/').pop(),
              organization_id,
              created_by
            });
            resolve(result);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  }

  async syncFromAPI(integrationId, organization_id, created_by) {
    // This would integrate with the integrations service
    // For now, return a placeholder
    const suppliers = [
      // Mock data - in real implementation, fetch from API
      {
        name: 'API Supplier 1',
        tier: 'Strategic',
        country_code: 'US',
        contact_email: 'contact@apisupplier1.com'
      }
    ];

    return this.bulkImport({
      suppliers,
      import_type: 'api_sync',
      source: `integration_${integrationId}`,
      organization_id,
      created_by
    });
  }

  async getImportBatches(organization_id) {
    return suppliersRepo.getImportBatches(organization_id);
  }

  async getImportBatch(batchId) {
    return suppliersRepo.getImportBatch(batchId);
  }
}

module.exports = new SuppliersService();
