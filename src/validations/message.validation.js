const { body, query, param } = require('express-validator');

const sendMessageValidation = [
    // Phone number validation - support both 'phoneNumber' and 'num' fields
    body().custom((value) => {
        if (!value.phoneNumber && !value.num) {
            throw new Error('Phone number is required. Use either "phoneNumber" or "num" field.');
        }
        return true;
    }),
    body('phoneNumber')
        .optional()
        .isMobilePhone()
        .withMessage('Invalid phone number format. Please provide a valid phone number in international format (e.g., +1234567890)')
        .matches(/^\+?[1-9]\d{1,14}$/) // Basic international phone number format
        .withMessage('Phone number must follow the international format (e.g., +1234567890)'),
    body('num')
        .optional()
        .isMobilePhone()
        .withMessage('Invalid phone number format. Please provide a valid phone number in international format (e.g., +1234567890)')
        .matches(/^\+?[1-9]\d{1,14}$/) // Basic international phone number format
        .withMessage('Phone number must follow the international format (e.g., +1234567890)'),

    // Validate either 'message' (for text) OR 'media' (for media content) but not both
    body().custom((value, { req }) => {
        const hasTextMessage = value.message !== undefined || value.msg !== undefined;
        const hasMedia = value.media !== undefined;
        // Check if there's an uploaded media file (for multipart form data)
        const hasUploadedMedia = req.file && req.file.fieldname === 'media';

        if (!hasTextMessage && !hasMedia && !hasUploadedMedia) {
            throw new Error('Either text message ("message" or "msg" field) or media content ("media" field) is required.');
        }

        if ((hasTextMessage || hasMedia) && hasUploadedMedia) {
            throw new Error('Cannot specify both text message/media in body and uploaded media file in the same request.');
        }

        return true;
    }),

    // Text message validation (when sending text only)
    body('message').optional().isString().isLength({ max: 4096 }).withMessage('Text message exceeds maximum length of 4096 characters'),
    body('msg').optional().isString().isLength({ max: 4096 }).withMessage('Text message exceeds maximum length of 4096 characters'),

    // Media content validation (when sending media)
    body('media').optional().isObject().withMessage('Media must be an object with type, data, filename, and mimetype'),
    body('media.type').optional().isString().isIn(['image', 'video', 'document', 'audio']).withMessage('Media type must be one of: image, video, document, audio'),
    body('media.data').optional().isString().withMessage('Media data must be a string (base64 encoded)'),
    body('media.filename').optional().isString().isLength({ max: 255 }).withMessage('Media filename exceeds maximum length of 255 characters'),
    body('media.mimetype')
        .optional()
        .isString()
        .matches(/^[a-z]+\/[a-z0-9.+_-]+$/)
        .withMessage('Media mimetype must be a valid format (e.g., image/jpeg)'),

    // Caption validation (when sending media with caption)
    body('caption').optional().isString().isLength({ max: 1024 }).withMessage('Caption exceeds maximum length of 1024 characters'),

    // Message options validation
    body('options').optional().isObject().withMessage('Options must be an object'),
    body('options.sendAudioAsVoice').optional().isBoolean().withMessage('sendAudioAsVoice must be a boolean'),
    body('options.sendVideoAsGif').optional().isBoolean().withMessage('sendVideoAsGif must be a boolean'),
    body('options.sendMediaAsSticker').optional().isBoolean().withMessage('sendMediaAsSticker must be a boolean'),
    body('options.sendMediaAsDocument').optional().isBoolean().withMessage('sendMediaAsDocument must be a boolean'),
    body('options.sendMediaAsHd').optional().isBoolean().withMessage('sendMediaAsHd must be a boolean'),
    body('options.quotedMessageId').optional().isString().withMessage('quotedMessageId must be a string'),
    body('options.mentions').optional().isArray().withMessage('mentions must be an array of contact IDs'),
    body('options.linkPreview').optional().isBoolean().withMessage('linkPreview must be a boolean'),

    // Validation for file uploads (when using multipart form data)
    body('messageType').optional().isIn(['image', 'video', 'document', 'audio']).withMessage('messageType must be one of: image, video, document, audio'),
    body('sendMediaAsDocument').optional().isBoolean().withMessage('sendMediaAsDocument must be a boolean'),
];

module.exports = {
    sendMessageValidation,
};
