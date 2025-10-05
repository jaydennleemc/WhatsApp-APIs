require('dotenv').config({ path: ['.env.local', '.env'] });
const express = require('express');
const config = require('./config/default');
const logger = require('./src/middleware/logger');
const limiter = require('./src/middleware/rateLimiter');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();

// Apply middleware
app.use(logger); // Logging middleware
app.use(limiter); // Rate limiting middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

const router = require('./src/routes/apiRoutes');
const { InitWhatsAppClient } = require('./src/whatsappClient');

app.use(router);

// Error handling middleware - should be the last middleware
app.use(errorHandler);

InitWhatsAppClient();

app.listen(config.port, () => {
  console.log(`WhatsApp API Server listening at http://localhost:${config.port}`);
});


