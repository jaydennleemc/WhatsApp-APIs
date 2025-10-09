const { sendWhatsAppMessage: clientSendWhatsAppMessage, sendWhatsAppMedia: clientSendWhatsAppMedia, getQrCode: clientGetQrCode } = require('../whatsappClient');
const { AppError } = require('../middleware/errorHandler');
const { logInfo, logError } = require('../utils/logger.util');
const { validateMediaContent } = require('../utils/media.utils');
const { MessageMedia } = require('whatsapp-web.js');

class MessageService {
    /**
     * Send a WhatsApp message (text or media)
     * @param {string} number - Phone number in international format
     * @param {string} message - Message content (for text messages)
     * @param {Object} media - Media content object (for media messages)
     * @param {string} caption - Caption for media messages
     * @param {Object} options - Additional message options
     * @returns {Promise<Object>} Message response object
     */
    static async sendWhatsAppMessage(number, message, media = undefined, caption = '', options = {}) {
        try {
            logInfo('Attempting to send WhatsApp message', {
                number,
                messageLength: message?.length || 0,
                hasMedia: !!media,
                captionLength: caption?.length || 0,
                options: options || {},
            });

            if (!number) {
                throw new AppError('Number is required', 400, 'fail');
            }

            // For now, we require either a message or media to be provided
            if (!message && !media) {
                throw new AppError('Message content or media file is required', 400, 'fail');
            }

            let result;
            if (media) {
                // Process media message
                result = await this.sendMediaMessage(number, media, caption, options);
            } else {
                // Handle text message with options
                result = await clientSendWhatsAppMessage(number, message, options);
            }

            logInfo('WhatsApp message sent successfully', {
                messageId: result.id._serialized,
                recipient: number,
                type: media ? media.type : 'text',
            });

            return result;
        } catch (error) {
            // Log the error for debugging
            logError('Error sending WhatsApp message', {
                error: error.message,
                number,
                message: message ? message.substring(0, 50) + '...' : null,
                hasMedia: !!media,
                caption: caption ? caption.substring(0, 50) + '...' : null,
            });

            // Re-throw the error to be handled by the controller
            if (error instanceof AppError) {
                throw error;
            } else {
                throw new AppError(error.message || 'Failed to send WhatsApp message', 500, 'error');
            }
        }
    }

    /**
     * Send a media message
     * @param {string} number - Phone number in international format
     * @param {Object} mediaContent - Media content object with type, data, filename, mimetype
     * @param {string} caption - Caption for the media
     * @param {Object} options - Additional message options
     * @returns {Promise<Object>} Message response object
     */
    static async sendMediaMessage(number, mediaContent, caption = '', options = {}) {
        try {
            // Validate media content
            const validation = validateMediaContent(mediaContent);
            if (!validation.success) {
                throw new AppError(`Invalid media content: ${validation.error}`, 400, 'fail');
            }

            // Create MessageMedia object from the media content
            const messageMedia = new MessageMedia(
                mediaContent.mimetype,
                mediaContent.data, // This should be the base64 data
                mediaContent.filename
            );

            // Prepare message options
            const messageOptions = {
                caption: caption || undefined,
                ...options, // Spread additional options
            };

            // Send the media message via the client
            const result = await clientSendWhatsAppMedia(number, messageMedia, messageOptions);

            return result;
        } catch (error) {
            logError('Error sending media message', {
                error: error.message,
                number,
                mediaType: mediaContent?.type,
                filename: mediaContent?.filename,
            });

            if (error instanceof AppError) {
                throw error;
            } else {
                throw new AppError(error.message || 'Failed to send media message', 500, 'error');
            }
        }
    }
}

module.exports = MessageService;
