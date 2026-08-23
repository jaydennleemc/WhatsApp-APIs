const fs = require('fs').promises;
const { processBase64Data, processUploadedFile, validateMediaContent, determineMimeType, cleanupTempFile } = require('../../../src/utils/media.utils');

describe('media.utils', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('processBase64Data', () => {
        it('accepts raw base64 and reports decoded size', async () => {
            const data = Buffer.from('hello').toString('base64');
            const result = await processBase64Data(data);
            expect(result).toEqual({ success: true, data, size: 5 });
        });

        it('strips a data-URL prefix', async () => {
            const data = Buffer.from('hello').toString('base64');
            const result = await processBase64Data(`data:image/jpeg;base64,${data}`);
            expect(result.success).toBe(true);
            expect(result.data).toBe(data);
        });

        it('rejects invalid base64 characters', async () => {
            const result = await processBase64Data('not base64!!');
            expect(result).toEqual({ success: false, error: 'Invalid base64 format' });
        });
    });

    describe('processUploadedFile', () => {
        it('encodes a multer file buffer', async () => {
            const buffer = Buffer.from('png-bytes');
            const result = await processUploadedFile({
                buffer,
                size: buffer.length,
                originalname: 'pic.png',
                mimetype: 'image/png',
            });

            expect(result.success).toBe(true);
            expect(result.data).toBe(buffer.toString('base64'));
            expect(result.originalName).toBe('pic.png');
        });

        it('fails when the file object has no buffer', async () => {
            const result = await processUploadedFile({});
            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid file object');
        });
    });

    describe('validateMediaContent', () => {
        const validImage = {
            type: 'image',
            data: Buffer.from('tiny').toString('base64'),
            filename: 'photo.jpg',
            mimetype: 'image/jpeg',
        };

        it('accepts a well-formed image payload', () => {
            const result = validateMediaContent(validImage);
            expect(result.success).toBe(true);
            expect(result.size).toBeGreaterThan(0);
        });

        it('requires type, data, filename, and mimetype', () => {
            expect(validateMediaContent({ type: 'image' }).success).toBe(false);
        });

        it('rejects unknown media types', () => {
            const result = validateMediaContent({ ...validImage, type: 'sticker' });
            expect(result.success).toBe(false);
            expect(result.error).toMatch(/Invalid media type/);
        });

        it('rejects document MIME types that are not application/*', () => {
            const result = validateMediaContent({
                type: 'document',
                data: Buffer.from('plain').toString('base64'),
                filename: 'notes.txt',
                mimetype: 'text/plain',
            });
            expect(result.success).toBe(false);
            expect(result.error).toMatch(/does not match the media type document/);
        });

        it('accepts application/pdf as a document', () => {
            const result = validateMediaContent({
                type: 'document',
                data: Buffer.from('%PDF').toString('base64'),
                filename: 'file.pdf',
                mimetype: 'application/pdf',
            });
            expect(result.success).toBe(true);
        });

        it('rejects oversized image payloads', () => {
            const huge = 'A'.repeat(16 * 1024 * 1024 * 2);
            const result = validateMediaContent({
                ...validImage,
                data: huge,
            });
            expect(result.success).toBe(false);
            expect(result.error).toMatch(/exceeds limit/);
        });
    });

    describe('determineMimeType', () => {
        it('looks up common extensions', () => {
            expect(determineMimeType('photo.jpg')).toBe('image/jpeg');
            expect(determineMimeType('clip.mp4')).toBe('video/mp4');
        });
    });

    describe('cleanupTempFile', () => {
        it('returns true when unlink succeeds', async () => {
            jest.spyOn(fs, 'unlink').mockResolvedValue(undefined);
            await expect(cleanupTempFile('/tmp/x')).resolves.toBe(true);
        });

        it('returns false when unlink fails', async () => {
            jest.spyOn(fs, 'unlink').mockRejectedValue(new Error('ENOENT'));
            await expect(cleanupTempFile('/tmp/x')).resolves.toBe(false);
        });
    });
});
