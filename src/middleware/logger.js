const { logInfo, logError } = require('../utils/logger');

const logger = (req, res, next) => {
    const startTime = Date.now();
    
    logInfo(`${req.method} ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logInfo(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`, {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });
    });
    
    next();
};

module.exports = logger;