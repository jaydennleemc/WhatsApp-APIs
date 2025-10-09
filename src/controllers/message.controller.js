const MessageService = require('../services/message.service');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccessResponse } = require('../utils/errors.util');

class MessageController {
    static async sendMessage(req, res, next) {
        try {
            // Support both parameter names for backward compatibility
            const num = req.body.phoneNumber || req.body.num;

            // Check if this is a multipart form request with uploaded file
            if (req.mediaData) {
                // Handle media message from multer upload
                const mediaContent = req.mediaData;
                const caption = req.body.caption || '';
                const messageType = req.body.messageType || mediaContent.type;
                const sendMediaAsDocument = req.body.sendMediaAsDocument === 'true';

                // Update media type based on request parameter
                mediaContent.type = messageType;

                // Prepare options from request body
                const options = {
                    sendMediaAsDocument: sendMediaAsDocument,
                    ...(req.body.options || {}),
                };

                const result = await MessageService.sendWhatsAppMessage(
                    num,
                    undefined, // No text message
                    mediaContent,
                    caption,
                    options
                );

                // Prepare response data for media message
                const responseData = {
                    messageId: result.id._serialized,
                    recipient: num,
                    type: mediaContent.type,
                    filename: mediaContent.filename,
                };

                return sendSuccessResponse(res, 200, 'Media message sent successfully', responseData);
            }
            // Check if this is a JSON request with media object
            else if (req.body.media) {
                // Handle media message from JSON request
                const mediaContent = req.body.media;
                const caption = req.body.caption || '';

                // Prepare options from request body
                const options = {
                    ...(req.body.options || {}),
                };

                const result = await MessageService.sendWhatsAppMessage(
                    num,
                    null, // No text message
                    mediaContent,
                    caption,
                    options
                );

                // Prepare response data for media message
                const responseData = {
                    messageId: result.id._serialized,
                    recipient: num,
                    type: mediaContent.type,
                    filename: mediaContent.filename,
                };

                return sendSuccessResponse(res, 200, 'Media message sent successfully', responseData);
            } else {
                // Handle text message (backward compatibility)
                const msg = req.body.message || req.body.msg;

                // Prepare options for text message
                const options = {
                    ...(req.body.options || {}),
                };

                const result = await MessageService.sendWhatsAppMessage(
                    num,
                    msg,
                    null, // No media
                    '', // No caption
                    options
                );

                // Prepare response data for text message
                const responseData = {
                    messageId: result.id._serialized,
                    recipient: num,
                    type: 'text',
                    message: msg,
                };

                return sendSuccessResponse(res, 200, 'Text message sent successfully', responseData);
            }
        } catch (error) {
            next(error); // Pass error to error handling middleware
        }
    }
}

module.exports = MessageController;
