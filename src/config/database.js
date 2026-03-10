const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('./index');

// support individual components if DATABASE_URL absent
const pool = new Pool({
  connectionString: config.db.connectionString || undefined,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

async function runMigrations() {
  const migrationFile = path.join(__dirname, '..', '..', 'migrations', '001_initial_schema.sql');
  const sql = fs.readFileSync(migrationFile, 'utf8');
  await pool.query(sql);
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  runMigrations,
};
