const { body, query, param } = require('express-validator');

const sendMessageValidation = [
    // Phone number validation - support both 'phoneNumber' and 'num' fields
    body()
        .custom((value) => {
            if (!value.phoneNumber && !value.num) {
                throw new Error('Phone number is required. Use either "phoneNumber" or "num" field.');
            }
            return true;
        }),
    body('phoneNumber').optional().isMobilePhone()
        .withMessage('Invalid phone number format. Please provide a valid phone number in international format (e.g., +1234567890)')
        .matches(/^\+?[1-9]\d{1,14}$/)  // Basic international phone number format
        .withMessage('Phone number must follow the international format (e.g., +1234567890)'),
    body('num').optional().isMobilePhone()
        .withMessage('Invalid phone number format. Please provide a valid phone number in international format (e.g., +1234567890)')
        .matches(/^\+?[1-9]\d{1,14}$/)  // Basic international phone number format
        .withMessage('Phone number must follow the international format (e.g., +1234567890)'),
    
    // Message validation - support both 'message' and 'msg' fields
    body()
        .custom((value) => {
            // For now, require either message text or file, but in current implementation we only support text
            if (!value.message && !value.msg) {
                throw new Error('Message content is required. Use either "message" or "msg" field.');
            }
            return true;
        }),
    body('message').optional().isLength({ max: 4096 }).withMessage('Message exceeds maximum length of 4096 characters'),
    body('msg').optional().isLength({ max: 4096 }).withMessage('Message exceeds maximum length of 4096 characters'),
    
    // Future validation for file uploads (currently optional until implemented)
    body('file').optional().custom((value, { req }) => {
        // Validate file if present
        if (req.file) {
            const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedMimes.includes(req.file.mimetype)) {
                throw new Error('Invalid file type. Only images and documents are allowed.');
            }
            
            if (req.file.size > 16000000) { // 16MB limit
                throw new Error('File too large. Maximum size is 16MB.');
            }
        }
        return true;
    }),
];

module.exports = {
    sendMessageValidation
};