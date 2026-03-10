class BaseRepository {
  constructor(table) {
    this.table = table;
  }

  async findAll(condition = 'TRUE', params = []) {
    const { rows } = await require('../config/database').query(
      `SELECT * FROM ${this.table} WHERE ${condition}`,
      params
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await require('../config/database').query(
      `SELECT * FROM ${this.table} WHERE id = $1`,
      [id]
    );
    return rows[0];
  }

  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(',');
    const { rows } = await require('../config/database').query(
      `INSERT INTO ${this.table} (${keys.join(',')}) VALUES(${placeholders}) RETURNING *`,
      values
    );
    return rows[0];
  }

  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const assignments = keys.map((k, i) => `${k}=$${i + 1}`).join(',');
    const { rows } = await require('../config/database').query(
      `UPDATE ${this.table} SET ${assignments} WHERE id=$${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    return rows[0];
  }

  async delete(id) {
    await require('../config/database').query(`DELETE FROM ${this.table} WHERE id=$1`, [id]);
    return true;
  }
}

module.exports = BaseRepository;
