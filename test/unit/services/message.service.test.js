jest.mock('../../../src/whatsappClient', () => ({
    sendWhatsAppMessage: jest.fn(),
    sendWhatsAppMedia: jest.fn(),
    getQrCode: jest.fn(),
}));

jest.mock('../../../src/utils/logger.util', () => ({
    logInfo: jest.fn(),
    logError: jest.fn(),
    logDebug: jest.fn(),
    logWarn: jest.fn(),
}));

jest.mock('whatsapp-web.js', () => ({
    MessageMedia: jest.fn().mockImplementation((mimetype, data, filename) => ({
        mimetype,
        data,
        filename,
    })),
}));

const { MessageMedia } = require('whatsapp-web.js');
const { sendWhatsAppMessage, sendWhatsAppMedia } = require('../../../src/whatsappClient');
const MessageService = require('../../../src/services/message.service');
const { AppError } = require('../../../src/middleware/errorHandler');

describe('MessageService', () => {
    const sent = { id: { _serialized: 'true_123@c.us_ABCDEF' } };

    beforeEach(() => {
        sendWhatsAppMessage.mockReset();
        sendWhatsAppMedia.mockReset();
        MessageMedia.mockClear();
    });

    it('rejects a missing number', async () => {
        await expect(MessageService.sendWhatsAppMessage(undefined, 'hi')).rejects.toMatchObject({
            statusCode: 400,
            message: 'Number is required',
        });
    });

    it('rejects when neither text nor media is provided', async () => {
        await expect(MessageService.sendWhatsAppMessage('+15551234567')).rejects.toMatchObject({
            statusCode: 400,
            message: 'Message content or media file is required',
        });
    });

    it('sends a text message through the client', async () => {
        sendWhatsAppMessage.mockResolvedValue(sent);

        const result = await MessageService.sendWhatsAppMessage('+15551234567', 'hello', null, '', { linkPreview: false });

        expect(sendWhatsAppMessage).toHaveBeenCalledWith('+15551234567', 'hello', { linkPreview: false });
        expect(result).toBe(sent);
        expect(sendWhatsAppMedia).not.toHaveBeenCalled();
    });

    it('sends valid media via MessageMedia', async () => {
        sendWhatsAppMedia.mockResolvedValue(sent);
        const media = {
            type: 'image',
            data: Buffer.from('img').toString('base64'),
            filename: 'pic.jpg',
            mimetype: 'image/jpeg',
        };

        const result = await MessageService.sendWhatsAppMessage('+15551234567', null, media, 'caption');

        expect(MessageMedia).toHaveBeenCalledWith('image/jpeg', media.data, 'pic.jpg');
        expect(sendWhatsAppMedia).toHaveBeenCalledWith(
            '+15551234567',
            { mimetype: 'image/jpeg', data: media.data, filename: 'pic.jpg' },
            expect.objectContaining({ caption: 'caption' })
        );
        expect(result).toBe(sent);
    });

    it('rejects invalid media before calling the client', async () => {
        await expect(
            MessageService.sendWhatsAppMessage('+15551234567', null, {
                type: 'image',
                data: 'x',
                filename: 'a.jpg',
            })
        ).rejects.toBeInstanceOf(AppError);

        expect(sendWhatsAppMedia).not.toHaveBeenCalled();
    });

    it('wraps client send failures in AppError 500', async () => {
        sendWhatsAppMessage.mockRejectedValue(new Error('Client is not ready'));

        await expect(MessageService.sendWhatsAppMessage('+15551234567', 'hi')).rejects.toMatchObject({
            statusCode: 500,
            message: 'Client is not ready',
        });
    });
});
