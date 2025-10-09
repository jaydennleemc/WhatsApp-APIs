const multer = require('multer');
const mimeTypes = require('mime-types');

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({
    storage: storage,
    // File size validation: 16MB for images, 100MB for videos/documents
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit (largest allowed by WhatsApp)
    },
    fileFilter: (req, file, cb) => {
        // Validate MIME types for supported media types
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp', // images
            'video/mp4',
            'video/quicktime',
            'video/x-msvideo',
            'video/mpeg', // videos
            'application/pdf',
            'application/msword',
            'application/vnd.ms-excel', // documents
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
            'text/plain',
            'application/zip',
        ];

        // Check if the file type is allowed
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Unsupported file type: ${file.mimetype}. Supported types: images, videos, documents.`), false);
        }
    },
});

// Middleware to handle single file uploads for media messages
const uploadMedia = upload.single('media');

// Middleware function to validate media content
const validateMediaContent = (req, res, next) => {
    // If this is a multipart upload, check for media file
    if (req.file) {
        // Set media info from uploaded file
        req.mediaData = {
            type: getFileType(req.file.mimetype),
            data: req.file.buffer.toString('base64'),
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
        };

        // Validate file size based on media type
        if (!validateFileSize(req.mediaData)) {
            return res.status(413).json({
                success: false,
                message: `File size exceeds limit for ${req.mediaData.type} type`,
                error: {
                    code: 'FILE_SIZE_LIMIT_EXCEEDED',
                    message: `File size of ${req.file.size} bytes exceeds limit`,
                },
                timestamp: new Date().toISOString(),
            });
        }
    }
    // If this is a JSON request with base64 media
    else if (req.body.media) {
        // Validate media object structure
        if (!req.body.media.type || !req.body.media.data || !req.body.media.filename || !req.body.media.mimetype) {
            return res.status(400).json({
                success: false,
                message: 'Media object must include type, data, filename, and mimetype',
                error: {
                    code: 'INVALID_MEDIA_FORMAT',
                    message: 'Missing required fields in media object',
                },
                timestamp: new Date().toISOString(),
            });
        }

        // Validate file size
        if (!validateFileSize(req.body.media)) {
            return res.status(413).json({
                success: false,
                message: `Base64 data size exceeds limit for ${req.body.media.type} type`,
                error: {
                    code: 'FILE_SIZE_LIMIT_EXCEEDED',
                    message: 'Base64 data size exceeds platform limits',
                },
                timestamp: new Date().toISOString(),
            });
        }
    }

    next();
};

// Helper function to determine file type based on MIME type
function getFileType(mimetype) {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    return 'document';
}

// Helper function to validate file size based on type
function validateFileSize(mediaData) {
    const { type, size } = mediaData;

    // Convert size from base64 to approximate original file size if needed
    // Base64 encoding increases size by about 33%, so we account for that
    const decodedSize = size ? Math.round(size / 1.33) : 0;

    switch (type) {
        case 'image':
            return decodedSize <= 16 * 1024 * 1024; // 16MB for images
        case 'video':
        case 'document':
            return decodedSize <= 100 * 1024 * 1024; // 100MB for videos/documents
        case 'audio':
            return decodedSize <= 16 * 1024 * 1024; // 16MB for audio
        default:
            return false;
    }
}

module.exports = {
    uploadMedia,
    validateMediaContent,
};
