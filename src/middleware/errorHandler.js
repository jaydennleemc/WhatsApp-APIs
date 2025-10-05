// Custom error class
class AppError extends Error {
    constructor(message, statusCode, status) {
        super(message);
        this.statusCode = statusCode;
        this.status = status || 'error';
        this.isOperational = true; // Mark as operational error

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
        error = new AppError(message, 404, 'fail');
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new AppError(message, 400, 'fail');
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new AppError(message, 400, 'fail');
    }

    // Validation errors from express-validator
    if (err.name === 'ValidationError' || err.isArray) {
        const message = err.array ? err.array().map(e => e.msg).join(', ') : err.message;
        error = new AppError(message, 400, 'fail');
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = { errorHandler, AppError };