function mockReq(overrides = {}) {
    return {
        method: 'GET',
        url: '/',
        originalUrl: '/',
        path: '/',
        ip: '127.0.0.1',
        headers: {},
        body: {},
        params: {},
        query: {},
        get: jest.fn().mockReturnValue('jest'),
        ...overrides,
        headers: { ...(overrides.headers || {}) },
        body: { ...(overrides.body || {}) },
    };
}

function mockRes() {
    const res = {};
    res.statusCode = 200;
    res.status = jest.fn((code) => {
        res.statusCode = code;
        return res;
    });
    res.json = jest.fn(() => res);
    res.send = jest.fn(() => res);
    res.on = jest.fn();
    return res;
}

function mockNext() {
    return jest.fn();
}

module.exports = { mockReq, mockRes, mockNext };
