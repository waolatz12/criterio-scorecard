const db = require('../config/database');
const logger = require('../config/logger');

async function init() {
  try {
    logger.info('Running initial migration...');
    await db.runMigrations();
    logger.info('Migrations applied successfully');
    process.exit(0);
  } catch (err) {
    logger.error('Migration error', err);
    process.exit(1);
  }
}

if (require.main === module) {
  init();
}

module.exports = { init };
