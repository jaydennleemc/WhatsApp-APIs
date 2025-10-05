const router = require('express').Router();
const { sendMessageValidation } = require('../validations/messageValidation');
const handleValidationErrors = require('../middleware/validation');

const AuthenticateController = require('../controllers/authController');
const MessageController = require('../controllers/messageController');

// Health check and authentication endpoints
router.get('/', AuthenticateController.handleRoot);
router.get('/auth/status', AuthenticateController.checkStatus);
router.get('/auth/qrcode', AuthenticateController.getQrCode);
router.get('/auth/qrcode/availability', AuthenticateController.checkQrCodeAvailability);

// Messaging endpoints
router.post('/messages', sendMessageValidation, handleValidationErrors, MessageController.sendMessage);

module.exports = router;
