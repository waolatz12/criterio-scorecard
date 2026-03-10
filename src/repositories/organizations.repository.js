const db = require('../config/database');
const BaseRepository = require('./base.repository');

class OrganizationsRepository extends BaseRepository {
  constructor() {
    super('organizations');
  }

  async findBySlug(slug) {
    const { rows } = await db.query(
      `SELECT * FROM organizations WHERE slug = $1`,
      [slug]
    );
    return rows[0];
  }

  async updateSettings(id, settings) {
    const { rows } = await db.query(
      `UPDATE organizations SET settings = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(settings), id]
    );
    return rows[0];
  }
}

module.exports = new OrganizationsRepository();
