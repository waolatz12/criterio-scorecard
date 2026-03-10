const http = require('http');
const createApp = require('./app');
const config = require('./config');
const logger = require('./config/logger');

const app = createApp();
const server = http.createServer(app);

server.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', err);
  process.exit(1);
});
