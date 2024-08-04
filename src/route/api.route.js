const router = require('express').Router();

const AuthenticateController = require('../controller/authController');
const MessageController = require('../controller/messageController');

router.get('/', async (req, res) => {
    res.json({
        code: 200,
        message: 'Whats APP API is working',
    });
});

router.get('/status', AuthenticateController.isAuthenticated);
router.get('/auth', AuthenticateController.authWhatsApp);
router.get('/send', MessageController.sendMessage);

module.exports = router;
