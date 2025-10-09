require('dotenv').config({ path: ['.env.local', '.env'] });
const express = require('express');
const config = require('./config/default');
const logger = require('./src/middleware/logger');
const limiter = require('./src/middleware/rateLimiter');
const { errorHandler } = require('./src/middleware/errorHandler');
const basePathMiddleware = require('./src/middleware/basePath.middleware');
const { generateAndStoreApiKeyIfNeeded } = require('./src/utils/apiKey.util');

const app = express();

// API key initialization on startup
async function initializeApiKey() {
    try {
        const apiKey = await generateAndStoreApiKeyIfNeeded();

        // Check if API key was newly generated or already existed
        const apiKeyExists = await require('./src/utils/apiKey.util').apiFileExists();

        if (apiKeyExists) {
            console.log('Existing API key detected');
            console.log(`API key file located at: ${require('./config/security').API_KEY_FILE_PATH}`);
            console.log(`API key: ${apiKey}`); // Show the existing API key value
        } else {
            console.log('API key generated successfully');
            console.log(`API key: ${apiKey}`); // Show full key as required by user on generation
        }
    } catch (error) {
        console.error('Failed to initialize API key:', error);
        process.exit(1); // Exit if we can't initialize the API key
    }
}

// Apply base path middleware first to handle configurable base path
app.use(basePathMiddleware);

// Apply other middleware
app.use(logger); // Logging middleware
app.use(limiter); // Rate limiting middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files with base path consideration
// The basePathMiddleware modifies req.url, so static files will be served correctly
app.use(express.static('public'));

const router = require('./src/routes/api.routes');
const { InitWhatsAppClient } = require('./src/whatsappClient');

// Apply the router after base path handling
app.use(router);

// Error handling middleware - should be the last middleware
app.use(errorHandler);

// Initialize API key before starting the server
initializeApiKey()
    .then(() => {
        InitWhatsAppClient();

        app.listen(config.port, () => {
            console.log(`WhatsApp API Server listening at http://localhost:${config.port}${config.basePath || '/'}`);
        });
    })
    .catch((error) => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
