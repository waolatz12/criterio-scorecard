const db = require('../config/database');

async function auditLogger(req, res, next) {
  const userId = req.user ? req.user.id : null;
  const { method, originalUrl } = req;
  try {
    await db.query(
      'INSERT INTO audit_logs(user_id, method, path) VALUES($1, $2, $3)',
      [userId, method, originalUrl]
    );
  } catch (err) {
    // ignore audit failures
  }
  next();
}

module.exports = { auditLogger };
