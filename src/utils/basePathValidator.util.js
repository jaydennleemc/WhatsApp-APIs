// Base path validation utility functions

/**
 * Validate base path format
 * @param {string} basePath - The base path to validate
 * @returns {object} Object with isValid boolean and optional error message
 */
function validateBasePath(basePath) {
    // Allow empty base path (default behavior)
    if (!basePath) {
        return {
            isValid: true,
            error: null,
        };
    }

    // Should start with '/' if not empty
    if (!basePath.startsWith('/')) {
        return {
            isValid: false,
            error: 'Base path must start with "/" if provided',
        };
    }

    // Should not end with '/' unless it's just '/'
    if (basePath.length > 1 && basePath.endsWith('/')) {
        return {
            isValid: false,
            error: 'Base path should not end with "/" unless it is just "/"',
        };
    }

    // Should not contain URL control characters
    const controlChars = /[<>"\s]/; // Added space as it's not allowed in URLs
    if (controlChars.test(basePath)) {
        return {
            isValid: false,
            error: 'Base path contains invalid characters',
        };
    }

    // Length validation - should not be extremely long
    if (basePath.length > 255) {
        return {
            isValid: false,
            error: 'Base path is too long (max 255 characters)',
        };
    }

    return {
        isValid: true,
        error: null,
    };
}

/**
 * Normalize the base path to ensure it follows the correct format
 * @param {string} basePath - The base path to normalize
 * @returns {string} The normalized base path
 */
function normalizeBasePath(basePath) {
    if (!basePath || basePath === '/') {
        return '';
    }

    // Ensure it starts with /
    if (!basePath.startsWith('/')) {
        basePath = '/' + basePath;
    }

    // Remove trailing slash unless it's just '/'
    if (basePath.length > 1 && basePath.endsWith('/')) {
        basePath = basePath.slice(0, -1);
    }

    return basePath;
}

module.exports = {
    validateBasePath,
    normalizeBasePath,
};
