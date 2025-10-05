const router = require('express').Router();
const { sendMessageValidation } = require('../validations/messageValidation');
const handleValidationErrors = require('../middleware/validation');
const { sendSuccessResponse } = require('../utils/errors');

const AuthenticateController = require('../controllers/authController');
const MessageController = require('../controllers/messageController');

// Health check endpoint
router.get('/', async (req, res) => {
    sendSuccessResponse(res, 200, 'WhatsApp API is working');
});

// Authentication endpoints
router.get('/auth/status', AuthenticateController.isAuthenticated);
router.get('/auth/qrcode', AuthenticateController.authWhatsApp);

// Messaging endpoints
router.post('/messages', sendMessageValidation, handleValidationErrors, MessageController.sendMessage);

module.exports = router;
