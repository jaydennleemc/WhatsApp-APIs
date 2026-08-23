const fs = require('fs').promises;
const crypto = require('crypto');
const { API_KEY_FILE_PATH, API_KEY_FILE_PERMISSIONS } = require('../../../config/security');
const { generateApiKey, validateApiKey, apiFileExists, storeApiKey, retrieveApiKey, generateAndStoreApiKeyIfNeeded } = require('../../../src/utils/apiKey.util');

describe('apiKey.util', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('generateApiKey', () => {
        it('returns a 64-character hex string', () => {
            const key = generateApiKey();
            expect(key).toMatch(/^[0-9a-f]{64}$/);
        });

        it('uses 32 bytes of cryptographic randomness', () => {
            const spy = jest.spyOn(crypto, 'randomBytes');
            generateApiKey();
            expect(spy).toHaveBeenCalledWith(32);
        });
    });

    describe('validateApiKey', () => {
        it('accepts a 64-char lowercase hex key', () => {
            expect(validateApiKey('a'.repeat(64))).toBe(true);
        });

        it('rejects uppercase, short, and non-string values', () => {
            expect(validateApiKey('A'.repeat(64))).toBe(false);
            expect(validateApiKey('abc')).toBe(false);
            expect(validateApiKey(null)).toBe(false);
            expect(validateApiKey(123)).toBe(false);
        });
    });

    describe('apiFileExists', () => {
        it('returns true when the key file is accessible', async () => {
            jest.spyOn(fs, 'access').mockResolvedValue(undefined);
            await expect(apiFileExists()).resolves.toBe(true);
            expect(fs.access).toHaveBeenCalledWith(API_KEY_FILE_PATH);
        });

        it('returns false when the key file is missing', async () => {
            jest.spyOn(fs, 'access').mockRejectedValue(Object.assign(new Error('missing'), { code: 'ENOENT' }));
            await expect(apiFileExists()).resolves.toBe(false);
        });
    });

    describe('storeApiKey', () => {
        it('writes the key and sets owner-only permissions', async () => {
            jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
            jest.spyOn(fs, 'chmod').mockResolvedValue(undefined);

            await storeApiKey('deadbeef'.repeat(8));

            expect(fs.writeFile).toHaveBeenCalledWith(API_KEY_FILE_PATH, 'deadbeef'.repeat(8), 'utf8');
            expect(fs.chmod).toHaveBeenCalledWith(API_KEY_FILE_PATH, API_KEY_FILE_PERMISSIONS);
        });

        it('continues when chmod is unsupported', async () => {
            jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
            jest.spyOn(fs, 'chmod').mockRejectedValue(new Error('EPERM'));

            await expect(storeApiKey('deadbeef'.repeat(8))).resolves.toBeUndefined();
            expect(console.warn).toHaveBeenCalled();
        });
    });

    describe('retrieveApiKey', () => {
        it('returns a trimmed key', async () => {
            jest.spyOn(fs, 'readFile').mockResolvedValue('  abcdef0123456789  \n');
            await expect(retrieveApiKey()).resolves.toBe('abcdef0123456789');
        });

        it('returns null when the file does not exist', async () => {
            jest.spyOn(fs, 'readFile').mockRejectedValue(Object.assign(new Error('missing'), { code: 'ENOENT' }));
            await expect(retrieveApiKey()).resolves.toBeNull();
        });

        it('rethrows unexpected filesystem errors', async () => {
            jest.spyOn(fs, 'readFile').mockRejectedValue(Object.assign(new Error('denied'), { code: 'EACCES' }));
            await expect(retrieveApiKey()).rejects.toThrow('denied');
        });
    });

    describe('generateAndStoreApiKeyIfNeeded', () => {
        it('returns the existing key when the file is present', async () => {
            jest.spyOn(fs, 'access').mockResolvedValue(undefined);
            jest.spyOn(fs, 'readFile').mockResolvedValue('a'.repeat(64));
            const writeSpy = jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

            await expect(generateAndStoreApiKeyIfNeeded()).resolves.toBe('a'.repeat(64));
            expect(writeSpy).not.toHaveBeenCalled();
        });

        it('generates and stores a key when none exists', async () => {
            jest.spyOn(fs, 'access').mockRejectedValue(new Error('missing'));
            jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
            jest.spyOn(fs, 'chmod').mockResolvedValue(undefined);
            jest.spyOn(crypto, 'randomBytes').mockReturnValue(Buffer.alloc(32, 0xab));

            const key = await generateAndStoreApiKeyIfNeeded();

            expect(key).toBe('ab'.repeat(32));
            expect(fs.writeFile).toHaveBeenCalled();
        });
    });
});
