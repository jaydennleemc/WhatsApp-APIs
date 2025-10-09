// Custom error class
class AppError extends Error {
    constructor(message, statusCode, status, code = null) {
        super(message);
        this.statusCode = statusCode;
        this.status = status || 'error';
        this.isOperational = true; // Mark as operational error
        this.code = code || 'GENERIC_ERROR'; // Add error code for more specific identification

        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    console.error(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new AppError(message, 404, 'fail', 'RESOURCE_NOT_FOUND');
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new AppError(message, 400, 'fail', 'DUPLICATE_FIELD');
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
        error = new AppError(message, 400, 'fail', 'VALIDATION_ERROR');
    }

    // Validation errors from express-validator
    if (err.name === 'ValidationError' || err.isArray) {
        const message = err.array
            ? err
                  .array()
                  .map((e) => e.msg)
                  .join(', ')
            : err.message;
        error = new AppError(message, 400, 'fail', 'VALIDATION_ERROR');
    }

    // Multer file size error (when file exceeds limits)
    if (err.code === 'LIMIT_FILE_SIZE') {
        const message = 'File too large. Please ensure your file size is within the allowed limits.';
        error = new AppError(message, 413, 'fail', 'FILE_SIZE_LIMIT_EXCEEDED');
    }

    // Multer file type error (when file type is not allowed)
    if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.message?.includes('Unsupported file type')) {
        const message = 'Unsupported file type. Please upload a supported media file.';
        error = new AppError(message, 400, 'fail', 'UNSUPPORTED_FILE_TYPE');
    }

    // Multer other file errors
    if (err.code?.startsWith('LIMIT_')) {
        const message = 'File upload error due to size or count restrictions';
        error = new AppError(message, 400, 'fail', 'FILE_LIMIT_ERROR');
    }

    // Custom AppError with specific error codes
    if (err.isOperational) {
        error = err;
    }

    // Format response based on error type
    const response = {
        success: false,
        message: error.message || 'Server Error',
        error: {
            code: error.code || 'INTERNAL_ERROR',
            message: error.message || 'An internal server error occurred',
        },
        timestamp: new Date().toISOString(),
    };

    // Add stack trace in development environment
    if (process.env.NODE_ENV === 'development' && err.stack) {
        response.stack = err.stack;
    }

    res.status(error.statusCode || 500).json(response);
};

module.exports = { errorHandler, AppError };
