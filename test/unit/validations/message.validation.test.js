const { validationResult } = require('express-validator');
const { sendMessageValidation } = require('../../../src/validations/message.validation');

async function run(body, file) {
    const req = { body, file, headers: {}, cookies: {} };
    for (const chain of sendMessageValidation) {
        await chain.run(req);
    }
    return validationResult(req);
}

describe('sendMessageValidation', () => {
    it('accepts a valid international text payload', async () => {
        const result = await run({ phoneNumber: '+12125551234', message: 'hello' });
        expect(result.isEmpty()).toBe(true);
    });

    it('accepts legacy num/msg fields', async () => {
        const result = await run({ num: '+12125551234', msg: 'hello' });
        expect(result.isEmpty()).toBe(true);
    });

    it('requires a phone number', async () => {
        const result = await run({ message: 'hello' });
        expect(result.array().map((e) => e.msg).join(' ')).toMatch(/Phone number is required/);
    });

    it('requires text or media', async () => {
        const result = await run({ phoneNumber: '+12125551234' });
        expect(result.array().map((e) => e.msg).join(' ')).toMatch(/text message.*or media/i);
    });

    it('rejects messages over 4096 characters', async () => {
        const result = await run({ phoneNumber: '+12125551234', message: 'x'.repeat(4097) });
        expect(result.array().some((e) => /4096/.test(e.msg))).toBe(true);
    });

    it('accepts a JSON media object', async () => {
        const result = await run({
            phoneNumber: '+12125551234',
            media: {
                type: 'image',
                data: 'aaaa',
                filename: 'a.jpg',
                mimetype: 'image/jpeg',
            },
            caption: 'hi',
        });
        expect(result.isEmpty()).toBe(true);
    });

    it('rejects unknown media types', async () => {
        const result = await run({
            phoneNumber: '+12125551234',
            media: {
                type: 'sticker',
                data: 'aaaa',
                filename: 'a.webp',
                mimetype: 'image/webp',
            },
        });
        expect(result.array().some((e) => /Media type must be one of/.test(e.msg))).toBe(true);
    });

    it('accepts an uploaded media file without a body message', async () => {
        const result = await run({ phoneNumber: '+12125551234' }, { fieldname: 'media', originalname: 'a.jpg' });
        expect(result.isEmpty()).toBe(true);
    });
});
