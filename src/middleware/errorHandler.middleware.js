const logger = require('../config/logger');

function errorHandler(err, req, res, next) {
  logger.error('Error occurred:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
