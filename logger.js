const winston = require('winston');

// Create a logger instance
const logger = winston.createLogger({
  level: 'info', // Set the default log level
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamp to log messages
    winston.format.simple(), // Simple text format
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console() // Log to the console
  ]
});

// Middleware to log API requests
const logAPIMiddleware = (req, res, next) => {
  logger.info(`Incoming ${req.method} request to ${req.url}`);
  next();
};

module.exports = {
  logger,
  logAPIMiddleware
};
