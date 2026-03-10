const { createLogger, format, transports } = require('winston');
const config = require('./index');

const logger = createLogger({
  level: config.nodeEnv === 'development' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'supplier-scorecard' },
  transports: [new transports.Console()],
});

module.exports = logger;
