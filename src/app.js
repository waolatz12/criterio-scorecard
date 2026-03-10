const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const config = require('./config');
const { initializeEmailService } = require('./config/email');
const passport = require('./config/passport');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler.middleware');
const { notFound } = require('./middleware/notFound.middleware');
const { requestLogger } = require('./middleware/requestLogger.middleware');
const { rateLimiter } = require('./middleware/rateLimiter.middleware');

function createApp() {
  const app = express();

  // Initialize email service
  initializeEmailService();

  // Initialize passport
  app.use(session({
    secret: config.jwt.secret,
    resave: false,
    saveUninitialized: false,
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // request logging
  app.use(requestLogger);
  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  }

  app.use('/api', rateLimiter, routes);

  // Serve static files
  app.use(express.static('public'));

  // 404 and error
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
