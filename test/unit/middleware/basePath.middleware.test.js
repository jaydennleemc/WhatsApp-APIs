const { mockReq, mockRes, mockNext } = require('../../helpers/http');

describe('basePath middleware', () => {
    const originalBase = process.env.BASE_PATH;
    const originalBuild = process.env.BUILD_BASE_PATH;

    afterEach(() => {
        process.env.BASE_PATH = originalBase;
        process.env.BUILD_BASE_PATH = originalBuild;
        jest.resetModules();
    });

    function loadMiddleware() {
        return require('../../../src/middleware/basePath.middleware');
    }

    it('leaves urls unchanged when no base path is set', () => {
        delete process.env.BASE_PATH;
        delete process.env.BUILD_BASE_PATH;
        jest.resetModules();
        const basePathMiddleware = loadMiddleware();

        const req = mockReq({ url: '/auth/status' });
        const res = mockRes();
        const next = mockNext();

        basePathMiddleware(req, res, next);

        expect(req.basePath).toBe('');
        expect(req.url).toBe('/auth/status');
        expect(next).toHaveBeenCalled();
    });

    it('strips a configured prefix from matching urls', () => {
        process.env.BASE_PATH = '/wa';
        jest.resetModules();
        const basePathMiddleware = loadMiddleware();

        const req = mockReq({ url: '/wa/auth/status' });
        basePathMiddleware(req, mockRes(), mockNext());

        expect(req.basePath).toBe('/wa');
        expect(req.url).toBe('/auth/status');
    });

    it('maps the prefix root to /', () => {
        process.env.BASE_PATH = 'wa/';
        jest.resetModules();
        const basePathMiddleware = loadMiddleware();

        const req = mockReq({ url: '/wa' });
        basePathMiddleware(req, mockRes(), mockNext());

        expect(req.basePath).toBe('/wa');
        expect(req.url).toBe('/');
    });

    it('clears basePath when the request is unprefixed', () => {
        process.env.BASE_PATH = '/wa';
        jest.resetModules();
        const basePathMiddleware = loadMiddleware();

        const req = mockReq({ url: '/healthz' });
        basePathMiddleware(req, mockRes(), mockNext());

        expect(req.basePath).toBe('');
        expect(req.url).toBe('/healthz');
    });
});
