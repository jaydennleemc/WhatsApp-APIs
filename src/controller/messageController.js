const { sendWhatsAppMessage } = require('../whatsappClient');

class MessageController {
    static async sendMessage(req, res) {
        if (req.query.num == null || req.query.msg == null) {
            return res.json({
                code: 401,
                message: 'missing number or message',
            });
        }

        try {
            await sendWhatsAppMessage(req.query.num, req.query.msg);
            return res.json({
                code: 200,
                message: 'Message sent',
            });
        } catch (error) {
            res.status(500).json({ error: error.message || 'An error occurred.' });
        }
    }
}

module.exports = MessageController;
