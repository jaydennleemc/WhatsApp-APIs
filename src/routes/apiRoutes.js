const router = require('express').Router();
const { sendMessageValidation } = require('../validations/messageValidation');
const handleValidationErrors = require('../middleware/validation');

const AuthenticateController = require('../controllers/authController');
const MessageController = require('../controllers/messageController');

// Configuration endpoint for base path
router.get('/config/base-path', (req, res) => {
  // Return the currently configured base path
  const basePath = req.basePath || '';
  res.json({ basePath });
});

// Health check and authentication endpoints
router.get('/', AuthenticateController.handleRoot);
router.get('/auth/status', AuthenticateController.checkStatus);
router.get('/auth/qrcode', AuthenticateController.getQrCode);
router.get('/auth/qrcode/availability', AuthenticateController.checkQrCodeAvailability);

// Messaging endpoints
router.post('/messages', sendMessageValidation, handleValidationErrors, MessageController.sendMessage);

module.exports = router;
