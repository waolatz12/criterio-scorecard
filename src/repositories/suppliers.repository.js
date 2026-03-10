const BaseRepository = require('./base.repository');
const db = require('../config/database');

class SuppliersRepository extends BaseRepository {
  constructor() {
    super('suppliers');
  }

  // Import batch methods
  async createImportBatch(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(',');
    const { rows } = await db.query(
      `INSERT INTO import_batches (${keys.join(',')}) VALUES(${placeholders}) RETURNING *`,
      values
    );
    return rows[0];
  }

  async updateImportBatch(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const assignments = keys.map((k, i) => `${k}=$${i + 1}`).join(',');
    const { rows } = await db.query(
      `UPDATE import_batches SET ${assignments} WHERE id=$${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    return rows[0];
  }

  async createImportBatchItem(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(',');
    const { rows } = await db.query(
      `INSERT INTO import_batch_items (${keys.join(',')}) VALUES(${placeholders}) RETURNING *`,
      values
    );
    return rows[0];
  }

  async getImportBatches(organization_id) {
    const { rows } = await db.query(
      `SELECT * FROM import_batches WHERE organization_id = $1 ORDER BY created_at DESC`,
      [organization_id]
    );
    return rows;
  }

  async getImportBatch(batchId) {
    const { rows } = await db.query(
      `SELECT * FROM import_batches WHERE id = $1`,
      [batchId]
    );
    return rows[0];
  }

  async getImportBatchItems(batchId) {
    const { rows } = await db.query(
      `SELECT * FROM import_batch_items WHERE batch_id = $1 ORDER BY row_number`,
      [batchId]
    );
    return rows;
  }

  // Supplier-specific queries
  async findByOrganization(organization_id) {
    return this.findAll('organization_id = $1', [organization_id]);
  }

  async findByTier(organization_id, tier) {
    return this.findAll('organization_id = $1 AND tier = $2', [organization_id, tier]);
  }
}

module.exports = new SuppliersRepository();
