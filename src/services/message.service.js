const { sendWhatsAppMessage: clientSendWhatsAppMessage, getQrCode: clientGetQrCode } = require('../whatsappClient');
const { AppError } = require('../middleware/errorHandler');
const { logInfo, logError } = require('../utils/logger.util');

class MessageService {
    /**
     * Send a WhatsApp message
     * @param {string} number - Phone number in international format
     * @param {string} message - Message content
     * @param {Object} media - Media file object (optional, for future use)
     * @returns {Promise<Object>} Message response object
     */
    static async sendWhatsAppMessage(number, message, media = null) {
        try {
            logInfo('Attempting to send WhatsApp message', { 
                number, 
                messageLength: message?.length || 0,
                hasMedia: !!media 
            });
            
            // Additional validation could be done here if needed
            if (!number) {
                throw new AppError('Number is required', 400, 'fail');
            }
            
            // For now, we require a message unless media is provided
            if (!message && !media) {
                throw new AppError('Message content or media file is required', 400, 'fail');
            }

            let result;
            if (media) {
                // Future implementation for sending media
                // result = await clientSendWhatsAppMedia(number, message, media);
                throw new AppError('Media sending is not yet implemented', 501, 'fail');
            } else {
                result = await clientSendWhatsAppMessage(number, message);
            }
            
            logInfo('WhatsApp message sent successfully', { messageId: result.id._serialized });
            return result;
        } catch (error) {
            // Log the error for debugging
            logError('Error sending WhatsApp message', { 
                error: error.message, 
                number, 
                message: message?.substring(0, 50) + '...',
                hasMedia: !!media
            });
            
            // Re-throw the error to be handled by the controller
            if (error instanceof AppError) {
                throw error;
            } else {
                throw new AppError(
                    error.message || 'Failed to send WhatsApp message',
                    500,
                    'error'
                );
            }
        }
    }
}

module.exports = MessageService;