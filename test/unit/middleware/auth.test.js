jest.mock('../../../src/utils/apiKey.util', () => ({
    retrieveApiKey: jest.fn(),
}));

const { retrieveApiKey } = require('../../../src/utils/apiKey.util');
const apiKeyAuth = require('../../../src/middleware/auth');
const { AUTH_ERROR_MESSAGE, AUTH_ERROR_CODE } = require('../../../config/security');
const { mockReq, mockRes, mockNext } = require('../../helpers/http');

const STORED_KEY = 'a'.repeat(64);

describe('apiKeyAuth middleware', () => {
    beforeEach(() => {
        retrieveApiKey.mockReset();
    });

    it('returns 500 when no stored key exists', async () => {
        retrieveApiKey.mockResolvedValue(null);
        const req = mockReq();
        const res = mockRes();
        const next = mockNext();

        await apiKeyAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                code: 'CONFIG_ERROR',
            })
        );
        expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when the key is missing', async () => {
        retrieveApiKey.mockResolvedValue(STORED_KEY);
        const req = mockReq({ method: 'POST', path: '/message' });
        const res = mockRes();
        const next = mockNext();

        await apiKeyAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: AUTH_ERROR_MESSAGE,
            code: AUTH_ERROR_CODE,
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when X-API-Key does not match', async () => {
        retrieveApiKey.mockResolvedValue(STORED_KEY);
        const req = mockReq({
            method: 'POST',
            path: '/message',
            headers: { 'x-api-key': 'b'.repeat(64) },
        });
        const res = mockRes();
        const next = mockNext();

        await apiKeyAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('accepts a matching X-API-Key header', async () => {
        retrieveApiKey.mockResolvedValue(STORED_KEY);
        const req = mockReq({
            method: 'POST',
            path: '/message',
            headers: { 'x-api-key': STORED_KEY },
        });
        const res = mockRes();
        const next = mockNext();

        await apiKeyAuth(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('accepts Authorization: Bearer', async () => {
        retrieveApiKey.mockResolvedValue(STORED_KEY);
        const req = mockReq({
            method: 'POST',
            path: '/message',
            headers: { authorization: `Bearer ${STORED_KEY}` },
        });
        const res = mockRes();
        const next = mockNext();

        await apiKeyAuth(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    it('returns 500 when retrieveApiKey throws', async () => {
        retrieveApiKey.mockRejectedValue(new Error('disk'));
        const req = mockReq();
        const res = mockRes();
        const next = mockNext();

        await apiKeyAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                code: 'INTERNAL_ERROR',
            })
        );
    });
});
