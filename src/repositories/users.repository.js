const BaseRepository = require('./base.repository');

class UsersRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  async findByEmail(email) {
    const db = require('../config/database');
    const { rows } = await db.query(
      `SELECT * FROM ${this.table} WHERE email = $1`,
      [email]
    );
    return rows[0];
  }

  async findById(id) {
    const db = require('../config/database');
    const { rows } = await db.query(
      `SELECT id, email, full_name, role, organization_id, is_active, created_at FROM ${this.table} WHERE id = $1`,
      [id]
    );
    return rows[0];
  }
}

module.exports = new UsersRepository();
