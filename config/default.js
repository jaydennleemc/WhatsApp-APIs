require('dotenv').config();

const config = {
    port: process.env.PORT || 3000,
    whatsapp: {
        clientName: process.env.WHATSAPP_CLIENT_NAME || 'whatsapp-api',
        sessionPath: process.env.WHATSAPP_SESSION_PATH || './session-data',
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        path: process.env.LOG_PATH || './logs',
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
    },
    defaultCountryCode: process.env.DEFAULT_COUNTRY_CODE || '1',
};

module.exports = config;