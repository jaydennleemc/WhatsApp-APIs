jest.mock('../../../src/utils/logger.util', () => ({
    logInfo: jest.fn(),
    logError: jest.fn(),
    logDebug: jest.fn(),
    logWarn: jest.fn(),
}));

const { logInfo } = require('../../../src/utils/logger.util');
const logger = require('../../../src/middleware/logger');
const { mockReq, mockRes, mockNext } = require('../../helpers/http');

describe('logger middleware', () => {
    it('logs the incoming request and the finished response', () => {
        const listeners = {};
        const req = mockReq({ method: 'POST', originalUrl: '/message' });
        const res = mockRes();
        res.statusCode = 200;
        res.on = jest.fn((event, handler) => {
            listeners[event] = handler;
        });
        const next = mockNext();

        logger(req, res, next);

        expect(logInfo).toHaveBeenCalledWith('POST /message', expect.objectContaining({ method: 'POST' }));
        expect(next).toHaveBeenCalled();

        listeners.finish();

        expect(logInfo).toHaveBeenCalledWith(expect.stringMatching(/POST \/message - 200 - \d+ms/), expect.objectContaining({ statusCode: 200 }));
    });
});
