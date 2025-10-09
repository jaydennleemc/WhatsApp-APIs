/**
 * Security Configuration for API Key Authentication
 * Contains security-related settings and constants
 */

module.exports = {
    // API Key settings
    API_KEY_LENGTH: 64, // Length of the API key in characters
    API_KEY_FILE_PATH: './.api_key', // Path where the API key will be stored
    API_KEY_HEADER_NAMES: ['X-API-Key', 'Authorization'], // Headers to check for API key
    API_KEY_PREFIX: 'Bearer ', // Prefix for Authorization header format
    API_KEY_REGEX: /^[0-9a-f]{64}$/, // Regex to validate API key format (64 hex chars)

    // Security settings
    LOG_API_KEY_PARTIAL: true, // Whether to log partial API key for debugging (never log full key in production)
    LOG_API_KEY_LENGTH_VISIBLE: 8, // Number of characters to show when logging partial key
    // For initial generation display, we show the full key in the console during initialization

    // Rate limiting (to prevent brute force attempts)
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100, // Max requests per window per IP
    RATE_LIMIT_MESSAGE: 'Too many requests, please try again later.',

    // Error messages (generic to avoid revealing key existence)
    AUTH_ERROR_MESSAGE: 'Unauthorized: Invalid or missing API key',
    AUTH_ERROR_CODE: 'AUTH_001',

    // File permissions for API key storage
    API_KEY_FILE_PERMISSIONS: 0o600, // Read/write for owner only
};
