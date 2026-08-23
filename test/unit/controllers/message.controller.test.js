jest.mock('../../../src/services/message.service', () => ({
    sendWhatsAppMessage: jest.fn(),
}));

const MessageService = require('../../../src/services/message.service');
const MessageController = require('../../../src/controllers/message.controller');
const { mockReq, mockRes, mockNext } = require('../../helpers/http');

const sent = { id: { _serialized: 'true_15551234567@c.us_ABC' } };

describe('MessageController.sendMessage', () => {
    beforeEach(() => {
        MessageService.sendWhatsAppMessage.mockReset();
    });

    it('sends a text message from phoneNumber/message', async () => {
        MessageService.sendWhatsAppMessage.mockResolvedValue(sent);
        const req = mockReq({
            body: { phoneNumber: '+15551234567', message: 'hello' },
        });
        const res = mockRes();

        await MessageController.sendMessage(req, res, mockNext());

        expect(MessageService.sendWhatsAppMessage).toHaveBeenCalledWith('+15551234567', 'hello', null, '', {});
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                message: 'Text message sent successfully',
                data: expect.objectContaining({
                    messageId: sent.id._serialized,
                    recipient: '+15551234567',
                    type: 'text',
                    message: 'hello',
                }),
            })
        );
    });

    it('accepts legacy num/msg fields', async () => {
        MessageService.sendWhatsAppMessage.mockResolvedValue(sent);
        const req = mockReq({
            body: { num: '15551234567', msg: 'legacy' },
        });

        await MessageController.sendMessage(req, mockRes(), mockNext());

        expect(MessageService.sendWhatsAppMessage).toHaveBeenCalledWith('15551234567', 'legacy', null, '', {});
    });

    it('sends multipart media from req.mediaData', async () => {
        MessageService.sendWhatsAppMessage.mockResolvedValue(sent);
        const mediaData = {
            type: 'image',
            data: 'aaaa',
            filename: 'pic.jpg',
            mimetype: 'image/jpeg',
        };
        const req = mockReq({
            body: { phoneNumber: '+15551234567', caption: 'hi', sendMediaAsDocument: 'true' },
        });
        req.mediaData = mediaData;
        const res = mockRes();

        await MessageController.sendMessage(req, res, mockNext());

        expect(MessageService.sendWhatsAppMessage).toHaveBeenCalledWith('+15551234567', undefined, mediaData, 'hi', {
            sendMediaAsDocument: true,
        });
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Media message sent successfully',
                data: expect.objectContaining({
                    type: 'image',
                    filename: 'pic.jpg',
                }),
            })
        );
    });

    it('sends JSON media from body.media', async () => {
        MessageService.sendWhatsAppMessage.mockResolvedValue(sent);
        const media = {
            type: 'document',
            data: 'bbbb',
            filename: 'file.pdf',
            mimetype: 'application/pdf',
        };
        const req = mockReq({
            body: { phoneNumber: '+15551234567', media, caption: 'doc' },
        });
        const res = mockRes();

        await MessageController.sendMessage(req, res, mockNext());

        expect(MessageService.sendWhatsAppMessage).toHaveBeenCalledWith('+15551234567', null, media, 'doc', {});
        expect(res.json.mock.calls[0][0].message).toBe('Media message sent successfully');
    });

    it('forwards service errors to next', async () => {
        const error = new Error('Client is not ready');
        MessageService.sendWhatsAppMessage.mockRejectedValue(error);
        const next = mockNext();

        await MessageController.sendMessage(mockReq({ body: { phoneNumber: '+1', message: 'x' } }), mockRes(), next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
