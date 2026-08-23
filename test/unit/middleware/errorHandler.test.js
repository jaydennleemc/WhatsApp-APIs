const { errorHandler, AppError } = require('../../../src/middleware/errorHandler');
const { mockReq, mockRes, mockNext } = require('../../helpers/http');

describe('errorHandler', () => {
    const req = mockReq();
    const next = mockNext();

    it('maps AppError to its status and code', () => {
        const res = mockRes();
        const err = new AppError('Number is required', 400, 'fail', 'GENERIC_ERROR');

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: 'Number is required',
                error: {
                    code: 'GENERIC_ERROR',
                    message: 'Number is required',
                },
            })
        );
        expect(res.json.mock.calls[0][0].stack).toBeUndefined();
    });

    it('maps Multer LIMIT_FILE_SIZE through the generic LIMIT_* branch (400)', () => {
        const res = mockRes();
        const err = Object.assign(new Error('too large'), { code: 'LIMIT_FILE_SIZE' });

        errorHandler(err, req, res, next);

        // LIMIT_FILE_SIZE is assigned 413 first, then overwritten because code still starts with LIMIT_
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json.mock.calls[0][0].error.code).toBe('FILE_LIMIT_ERROR');
    });

    it('maps unsupported file types to 400', () => {
        const res = mockRes();
        const err = new Error('Unsupported file type: audio/mpeg. Supported types: images, videos, documents.');

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json.mock.calls[0][0].error.code).toBe('UNSUPPORTED_FILE_TYPE');
    });

    it('maps CastError to 404', () => {
        const res = mockRes();
        const err = Object.assign(new Error('cast'), { name: 'CastError' });

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json.mock.calls[0][0].error.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('throws when err.code is numeric (Mongoose 11000 hits startsWith)', () => {
        const res = mockRes();
        const err = Object.assign(new Error('dup'), { code: 11000 });

        expect(() => errorHandler(err, req, res, next)).toThrow(TypeError);
    });

    it('defaults unknown errors to 500', () => {
        const res = mockRes();
        errorHandler(new Error('boom'), req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json.mock.calls[0][0].error.code).toBe('INTERNAL_ERROR');
    });

    it('includes stack traces in development', () => {
        const previous = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        const res = mockRes();
        const err = new Error('dev boom');

        errorHandler(err, req, res, next);

        expect(res.json.mock.calls[0][0].stack).toEqual(expect.any(String));
        process.env.NODE_ENV = previous;
    });
});
