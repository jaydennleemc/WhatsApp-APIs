const { validateMediaContent } = require('../../../src/middleware/upload.middleware');
const { mockReq, mockRes, mockNext } = require('../../helpers/http');

describe('upload.middleware validateMediaContent', () => {
    it('attaches mediaData from an uploaded image and continues', () => {
        const buffer = Buffer.from('fake-png');
        const req = mockReq();
        req.file = {
            mimetype: 'image/png',
            buffer,
            originalname: 'shot.png',
            size: buffer.length,
        };
        const res = mockRes();
        const next = mockNext();

        validateMediaContent(req, res, next);

        expect(req.mediaData).toEqual({
            type: 'image',
            data: buffer.toString('base64'),
            filename: 'shot.png',
            mimetype: 'image/png',
            size: buffer.length,
        });
        expect(next).toHaveBeenCalled();
    });

    it('classifies application/pdf as document', () => {
        const buffer = Buffer.from('%PDF');
        const req = mockReq();
        req.file = {
            mimetype: 'application/pdf',
            buffer,
            originalname: 'doc.pdf',
            size: buffer.length,
        };

        validateMediaContent(req, mockRes(), mockNext());

        expect(req.mediaData.type).toBe('document');
    });

    it('rejects oversized uploaded images with 413', () => {
        const req = mockReq();
        req.file = {
            mimetype: 'image/jpeg',
            buffer: Buffer.alloc(10),
            originalname: 'huge.jpg',
            size: 16 * 1024 * 1024 * 2,
        };
        const res = mockRes();
        const next = mockNext();

        validateMediaContent(req, res, next);

        expect(res.status).toHaveBeenCalledWith(413);
        expect(res.json.mock.calls[0][0].error.code).toBe('FILE_SIZE_LIMIT_EXCEEDED');
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects incomplete JSON media objects', () => {
        const req = mockReq({ body: { media: { type: 'image' } } });
        const res = mockRes();
        const next = mockNext();

        validateMediaContent(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json.mock.calls[0][0].error.code).toBe('INVALID_MEDIA_FORMAT');
        expect(next).not.toHaveBeenCalled();
    });

    it('passes through JSON media when size is omitted (decoded size 0)', () => {
        const req = mockReq({
            body: {
                media: {
                    type: 'image',
                    data: 'aaaa',
                    filename: 'a.jpg',
                    mimetype: 'image/jpeg',
                },
            },
        });
        const next = mockNext();

        validateMediaContent(req, mockRes(), next);

        expect(next).toHaveBeenCalled();
    });

    it('calls next when there is no file or media body', () => {
        const next = mockNext();
        validateMediaContent(mockReq(), mockRes(), next);
        expect(next).toHaveBeenCalled();
    });
});
