const mimeTypes = require('mime-types');
const fs = require('fs').promises;
const path = require('path');

/**
 * Process base64 data and validate format
 * @param {string} base64Data - Base64 encoded media data
 * @returns {Promise<Object>} - Object with validation result and processed data
 */
const processBase64Data = async (base64Data) => {
    try {
        // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,..." or "data:video/mp4;base64,...")
        let cleanBase64 = base64Data;
        if (base64Data.startsWith('data:')) {
            const parts = base64Data.split(';base64,');
            if (parts.length === 2) {
                cleanBase64 = parts[1];
            }
        }

        // Validate that the string contains only valid base64 characters
        const validBase64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!validBase64Regex.test(cleanBase64)) {
            throw new Error('Invalid base64 format');
        }

        // Check if the decoded data is valid by attempting to decode
        const buffer = Buffer.from(cleanBase64, 'base64');
        const actualSize = buffer.length;

        // Verify that the decoded data isn't corrupted by re-encoding
        if (buffer.toString('base64') !== cleanBase64) {
            throw new Error('Base64 data appears to be corrupted');
        }

        return {
            success: true,
            data: cleanBase64,
            size: actualSize,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Process uploaded files and convert to base64
 * @param {Object} file - Uploaded file object from multer
 * @returns {Promise<Object>} - Object with validation result and processed data
 */
const processUploadedFile = async (file) => {
    try {
        if (!file || !file.buffer) {
            throw new Error('Invalid file object');
        }

        const base64Data = file.buffer.toString('base64');

        return {
            success: true,
            data: base64Data,
            size: file.size,
            originalName: file.originalname,
            mimetype: file.mimetype,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Validate media content against WhatsApp limits
 * @param {Object} mediaContent - Media content object with type, data, filename, mimetype
 * @returns {Object} - Validation result
 */
const validateMediaContent = (mediaContent) => {
    try {
        const { type, data, filename, mimetype } = mediaContent;

        // Validate required fields
        if (!type || !data || !filename || !mimetype) {
            return {
                success: false,
                error: 'Missing required media properties: type, data, filename, and mimetype are all required',
            };
        }

        // Validate media type
        const validTypes = ['image', 'video', 'document', 'audio'];
        if (!validTypes.includes(type)) {
            return {
                success: false,
                error: `Invalid media type: ${type}. Must be one of: ${validTypes.join(', ')}`,
            };
        }

        // Validate filename
        if (typeof filename !== 'string' || filename.length > 255) {
            return {
                success: false,
                error: 'Filename must be a string with maximum length of 255 characters',
            };
        }

        // Validate mimetype format
        const mimeTypeRegex = /^[a-z]+\/[a-z0-9.+_-]+$/;
        if (!mimeTypeRegex.test(mimetype)) {
            return {
                success: false,
                error: `Invalid mimetype format: ${mimetype}`,
            };
        }

        // Determine the expected MIME type category based on the media type
        let expectedMimeTypeCategory = type;
        if (type === 'document') {
            expectedMimeTypeCategory = 'application';
        }

        // Validate that the provided MIME type matches the expected category
        if (!mimetype.startsWith(`${expectedMimeTypeCategory}/`)) {
            return {
                success: false,
                error: `MIME type ${mimetype} does not match the media type ${type}`,
            };
        }

        // Validate data format (checking if it's a valid base64 string)
        const validBase64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (typeof data !== 'string' || !validBase64Regex.test(data)) {
            return {
                success: false,
                error: 'Media data must be a valid base64 encoded string',
            };
        }

        // Calculate approximate original file size from base64 data
        // Base64 encoding increases size by about 33%, so we account for that
        const base64Size = data.length;
        const decodedSize = Math.round(base64Size / 1.33);

        // Validate size limits based on media type
        let sizeLimit;
        switch (type) {
            case 'image':
            case 'audio':
                sizeLimit = 16 * 1024 * 1024; // 16MB for images and audio
                break;
            case 'video':
            case 'document':
                sizeLimit = 100 * 1024 * 1024; // 100MB for videos and documents
                break;
            default:
                sizeLimit = 16 * 1024 * 1024; // Default to 16MB
        }

        if (decodedSize > sizeLimit) {
            return {
                success: false,
                error: `Media file size (${decodedSize} bytes) exceeds limit of ${sizeLimit} bytes for type ${type}`,
            };
        }

        return {
            success: true,
            size: decodedSize,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Determine MIME type for files
 * @param {string} filename - Name of the file
 * @returns {string|null} - Detected MIME type or null if not found
 */
const determineMimeType = (filename) => {
    const mimeType = mimeTypes.lookup(filename);
    return mimeType;
};

/**
 * Clean up temporary file
 * @param {string} filePath - Path to the temporary file to remove
 * @returns {Promise<boolean>} - True if deletion was successful
 */
const cleanupTempFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
        return true;
    } catch (error) {
        console.error(`Error deleting temporary file ${filePath}:`, error.message);
        return false;
    }
};

module.exports = {
    processBase64Data,
    processUploadedFile,
    validateMediaContent,
    determineMimeType,
    cleanupTempFile,
};
