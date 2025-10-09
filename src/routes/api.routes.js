const router = require('express').Router();
const { sendMessageValidation } = require('../validations/message.validation');
const handleValidationErrors = require('../middleware/validation');
const apiKeyAuth = require('../middleware/auth');
const { uploadMedia, validateMediaContent } = require('../middleware/upload.middleware');

const AuthenticateController = require('../controllers/auth.controller');
const MessageController = require('../controllers/message.controller');

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

// Messaging endpoints - protected with API key authentication
// Use upload middleware to handle file uploads and validation
router.post('/message', 
    apiKeyAuth, 
    uploadMedia, 
    validateMediaContent, 
    sendMessageValidation, 
    handleValidationErrors, 
    MessageController.sendMessage
);

module.exports = router;
