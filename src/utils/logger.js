const winston = require('winston');
const config = require('../../config/default');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync(config.logging.path)) {
    fs.mkdirSync(config.logging.path, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Define transports (where to log)
const transports = [
    new winston.transports.File({ 
        filename: path.join(config.logging.path, 'error.log'), 
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
    }),
    new winston.transports.File({ 
        filename: path.join(config.logging.path, 'combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5
    })
];

// In development, also log to console
if (process.env.NODE_ENV !== 'production') {
    transports.push(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    );
}

const logger = winston.createLogger({
    level: config.logging.level,
    format: logFormat,
    transports,
});

// Create a simple logger function that also logs to console in development
const logInfo = (message, meta = {}) => {
    logger.info(message, meta);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`INFO: ${message}`, meta);
    }
};

const logError = (message, meta = {}) => {
    logger.error(message, meta);
    if (process.env.NODE_ENV !== 'production') {
        console.error(`ERROR: ${message}`, meta);
    }
};

const logWarn = (message, meta = {}) => {
    logger.warn(message, meta);
    if (process.env.NODE_ENV !== 'production') {
        console.warn(`WARN: ${message}`, meta);
    }
};

const logDebug = (message, meta = {}) => {
    logger.debug(message, meta);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`DEBUG: ${message}`, meta);
    }
};

module.exports = {
    logger,
    logInfo,
    logError,
    logWarn,
    logDebug
};