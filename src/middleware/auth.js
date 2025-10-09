/**
 * API Key Authentication Middleware
 * Middleware to authenticate requests using API key
 */

const { retrieveApiKey } = require('../utils/apiKey.util');
const { API_KEY_HEADER_NAMES, API_KEY_PREFIX, AUTH_ERROR_MESSAGE, AUTH_ERROR_CODE, LOG_API_KEY_PARTIAL, LOG_API_KEY_LENGTH_VISIBLE } = require('../../config/security');

/**
 * Authentication middleware for API key validation
 * Checks for valid API key in request headers
 */
const apiKeyAuth = async (req, res, next) => {
    try {
        // Retrieve the stored API key
        const storedApiKey = await retrieveApiKey();

        if (!storedApiKey) {
            // No API key is set up, which is a server configuration issue
            console.error('API key authentication failed: No stored API key found');
            return res.status(500).json({
                success: false,
                error: 'Server configuration error: No API key set',
                code: 'CONFIG_ERROR',
            });
        }

        // Extract API key from headers
        let apiKey = null;

        // Check X-API-Key header
        if (req.headers['x-api-key']) {
            apiKey = req.headers['x-api-key'];
        }
        // Check Authorization header with Bearer prefix
        else if (req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith(API_KEY_PREFIX)) {
                apiKey = authHeader.substring(API_KEY_PREFIX.length).trim();
            }
        }

        // Log the API key usage based on security requirements
        if (apiKey && LOG_API_KEY_PARTIAL) {
            // Log only a partial key to avoid full exposure
            const partialKey = apiKey.substring(0, LOG_API_KEY_LENGTH_VISIBLE) + '...';
            console.log(`API key used for ${req.method} ${req.path}: ${partialKey}`);
        }

        // If no API key provided, return unauthorized
        if (!apiKey) {
            return res.status(401).json({
                success: false,
                error: AUTH_ERROR_MESSAGE,
                code: AUTH_ERROR_CODE,
            });
        }

        // Validate the API key format
        if (apiKey !== storedApiKey) {
            // Return generic error to avoid revealing whether the key exists or not
            return res.status(401).json({
                success: false,
                error: AUTH_ERROR_MESSAGE,
                code: AUTH_ERROR_CODE,
            });
        }

        // API key is valid, proceed to next middleware/route handler
        next();
    } catch (error) {
        console.error('API key authentication error:', error);

        // Return generic error to avoid revealing internal server issues
        return res.status(500).json({
            success: false,
            error: 'Internal server error during authentication',
            code: 'INTERNAL_ERROR',
        });
    }
};

module.exports = apiKeyAuth;
