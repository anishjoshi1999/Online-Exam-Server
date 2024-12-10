// logger.js
const winston = require('winston');

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

const logger = winston.createLogger({
  level: 'info', // Set default log level
  format: logFormat,
  transports: [
    new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), logFormat) }), // Console log
    new winston.transports.File({ filename: 'logs/combined.log' }), // Log to file
    new winston.transports.File({ filename: 'logs/errors.log', level: 'error' }) // Error log to file
  ],
});

module.exports = logger;
