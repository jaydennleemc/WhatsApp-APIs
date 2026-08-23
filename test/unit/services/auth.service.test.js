jest.mock('../../../src/whatsappClient', () => ({
    getQrCode: jest.fn(),
    isQrCodeAvailable: jest.fn(),
}));

jest.mock('../../../src/utils/common.util', () => ({
    isAuthenticated: jest.fn(),
    writeAuthenticated: jest.fn(),
}));

jest.mock('../../../src/utils/logger.util', () => ({
    logInfo: jest.fn(),
    logError: jest.fn(),
    logDebug: jest.fn(),
    logWarn: jest.fn(),
}));

const { getQrCode, isQrCodeAvailable } = require('../../../src/whatsappClient');
const { isAuthenticated } = require('../../../src/utils/common.util');
const AuthService = require('../../../src/services/auth.service');
const { AppError } = require('../../../src/middleware/errorHandler');

describe('AuthService', () => {
    beforeEach(() => {
        getQrCode.mockReset();
        isQrCodeAvailable.mockReset();
        isAuthenticated.mockReset();
    });

    describe('getQrCode', () => {
        it('returns the client QR string', () => {
            getQrCode.mockReturnValue('otpauth-like-payload');
            expect(AuthService.getQrCode()).toBe('otpauth-like-payload');
        });

        it('throws AppError 400 when the QR is missing', () => {
            getQrCode.mockReturnValue('');
            expect(() => AuthService.getQrCode()).toThrow(AppError);
            try {
                AuthService.getQrCode();
            } catch (error) {
                expect(error.statusCode).toBe(400);
                expect(error.message).toMatch(/QR code is not available/);
            }
        });
    });

    describe('isAuthenticated', () => {
        it('returns the status-file flag', async () => {
            isAuthenticated.mockResolvedValue(true);
            await expect(AuthService.isAuthenticated()).resolves.toBe(true);
        });

        it('wraps unexpected errors in AppError 500', async () => {
            isAuthenticated.mockRejectedValue(new Error('disk'));
            await expect(AuthService.isAuthenticated()).rejects.toMatchObject({
                statusCode: 500,
                message: 'disk',
            });
        });
    });

    describe('isQrCodeAvailable', () => {
        it('delegates to the client', () => {
            isQrCodeAvailable.mockReturnValue(true);
            expect(AuthService.isQrCodeAvailable()).toBe(true);
        });
    });
});
