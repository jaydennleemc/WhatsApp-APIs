// AppError class is already defined in middleware/errorHandler.js
// This file can contain additional error-related utilities

// Function to send error responses consistently
const sendErrorResponse = (res, statusCode, message, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(errors && { errors }),
        timestamp: new Date().toISOString(),
    });
};

// Function to send success responses consistently
const sendSuccessResponse = (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
        success: true,
        message,
        ...(data && { data }),
        timestamp: new Date().toISOString(),
    });
};

module.exports = {
    sendErrorResponse,
    sendSuccessResponse,
};
