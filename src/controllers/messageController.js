const MessageService = require('../services/messageService');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccessResponse } = require('../utils/errors');

class MessageController {
    static async sendMessage(req, res, next) {
        try {
            // Support both parameter names for backward compatibility
            const num = req.body.phoneNumber || req.body.num;
            const msg = req.body.message || req.body.msg;
            
            // The validation is now handled by express-validator middleware
            const result = await MessageService.sendWhatsAppMessage(num, msg);
            
            // Prepare response data based on content type
            const responseData = { 
                messageId: result.id._serialized,
                phone: num,
                message: msg
            };
            
            return sendSuccessResponse(res, 200, 'Message sent successfully', responseData);
        } catch (error) {
            next(error); // Pass error to error handling middleware
        }
    }
}

module.exports = MessageController;
