jest.mock('../../src/utils/logger.util', () => ({
    logInfo: jest.fn(),
    logError: jest.fn(),
    logDebug: jest.fn(),
    logWarn: jest.fn(),
}));

jest.mock('../../src/utils/common.util', () => ({
    writeAuthenticated: jest.fn(),
    isAuthenticated: jest.fn(),
}));

jest.mock('../../src/utils/media.utils', () => ({
    cleanupTempFile: jest.fn(),
}));

jest.mock('whatsapp-web.js', () => {
    const handlers = {};
    const mockClient = {
        on: jest.fn((event, cb) => {
            handlers[event] = cb;
        }),
        initialize: jest.fn().mockResolvedValue(undefined),
        sendMessage: jest.fn(),
    };
    return {
        Client: jest.fn(() => mockClient),
        LocalAuth: jest.fn().mockImplementation(() => ({})),
        MessageMedia: jest.fn(),
        __mock: { mockClient, handlers },
    };
});

function load() {
    jest.resetModules();
    const { __mock } = require('whatsapp-web.js');
    const { writeAuthenticated } = require('../../src/utils/common.util');
    const api = require('../../src/whatsappClient');
    return { api, __mock, writeAuthenticated };
}

describe('whatsappClient (mocked whatsapp-web.js)', () => {
    let api;
    let mockClient;
    let handlers;
    let writeAuthenticated;

    beforeEach(() => {
        const loaded = load();
        api = loaded.api;
        mockClient = loaded.__mock.mockClient;
        handlers = loaded.__mock.handlers;
        writeAuthenticated = loaded.writeAuthenticated;
        writeAuthenticated.mockClear();
    });

    it('registers lifecycle handlers at load', () => {
        expect(mockClient.on).toHaveBeenCalledWith('qr', expect.any(Function));
        expect(mockClient.on).toHaveBeenCalledWith('ready', expect.any(Function));
        expect(mockClient.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
    });

    it('exposes the QR after the qr event', () => {
        expect(api.isQrCodeAvailable()).toBeFalsy();
        handlers.qr('scan-me');
        expect(api.getQrCode()).toBe('scan-me');
        expect(api.isQrCodeAvailable()).toBe(true);
    });

    it('writes authenticated true on ready and false on disconnect', () => {
        handlers.ready();
        expect(writeAuthenticated).toHaveBeenCalledWith({ authenticated: true });

        handlers.disconnected('LOGOUT');
        expect(writeAuthenticated).toHaveBeenCalledWith({ authenticated: false });
    });

    it('marks unauthenticated on CONFLICT', () => {
        handlers.change_state('CONFLICT');
        expect(writeAuthenticated).toHaveBeenCalledWith({ authenticated: false });
    });

    it('rejects send when the client is not ready', async () => {
        await expect(api.sendWhatsAppMessage('+15551234567', 'hi')).rejects.toThrow('Client is not ready');
    });

    it('formats numbers as chat ids and sends text after ready', async () => {
        handlers.ready();
        mockClient.sendMessage.mockResolvedValue({ id: { _serialized: 'mid' } });

        const result = await api.sendWhatsAppMessage('+1 (555) 123-4567', 'hello');

        expect(mockClient.sendMessage).toHaveBeenCalledWith('15551234567@c.us', 'hello', {});
        expect(result.id._serialized).toBe('mid');
    });

    it('sends media and defaults video sendMediaAsDocument to false', async () => {
        handlers.ready();
        mockClient.sendMessage.mockResolvedValue({ id: { _serialized: 'vid' } });
        const media = { mimetype: 'video/mp4', filename: 'clip.mp4' };

        await api.sendWhatsAppMedia('15551234567', media, {});

        expect(mockClient.sendMessage).toHaveBeenCalledWith('15551234567@c.us', media, { sendMediaAsDocument: false });
    });

    it('wraps Puppeteer evaluation failures with a codec hint', async () => {
        handlers.ready();
        mockClient.sendMessage.mockRejectedValue(new Error('Evaluation failed: protocol error'));
        const media = { mimetype: 'video/mp4', filename: 'clip.mp4' };

        await expect(api.sendWhatsAppMedia('15551234567', media)).rejects.toThrow(/H\.264/);
    });

    it('initializes the library client once', async () => {
        await api.InitWhatsAppClient();
        expect(mockClient.initialize).toHaveBeenCalledTimes(1);
    });

    it('does not start a second initialize while the first is in flight', async () => {
        let resolveInit;
        mockClient.initialize.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveInit = resolve;
                })
        );

        const first = api.InitWhatsAppClient();
        await api.InitWhatsAppClient();

        expect(mockClient.initialize).toHaveBeenCalledTimes(1);
        resolveInit();
        await first;
    });

    it('writes unauthenticated when initialize fails', async () => {
        mockClient.initialize.mockRejectedValue(new Error('no chrome'));
        await api.InitWhatsAppClient();
        expect(writeAuthenticated).toHaveBeenCalledWith({ authenticated: false });
    });
});
