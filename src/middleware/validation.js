const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Format errors to match our error handling
        const errorMessages = errors.array().map(error => error.msg).join(', ');
        return res.status(400).json({
            success: false,
            message: errorMessages,
            errors: errors.array()
        });
    }
    next();
};

module.exports = handleValidationErrors;