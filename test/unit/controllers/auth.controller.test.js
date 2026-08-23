jest.mock('../../../src/services/auth.service', () => ({
    getQrCode: jest.fn(),
    isAuthenticated: jest.fn(),
    isQrCodeAvailable: jest.fn(),
}));

jest.mock('fs', () => ({
    readFileSync: jest.fn(),
}));

const fs = require('fs');
const AuthService = require('../../../src/services/auth.service');
const AuthenticateController = require('../../../src/controllers/auth.controller');
const { mockReq, mockRes, mockNext } = require('../../helpers/http');

describe('AuthenticateController', () => {
    beforeEach(() => {
        AuthService.getQrCode.mockReset();
        AuthService.isAuthenticated.mockReset();
        AuthService.isQrCodeAvailable.mockReset();
        fs.readFileSync.mockReset();
    });

    describe('handleRoot', () => {
        it('serves the pairing HTML', async () => {
            fs.readFileSync.mockReturnValue('<html>qr</html>');
            const res = mockRes();

            await AuthenticateController.handleRoot(mockReq({ basePath: '/wa' }), res, mockNext());

            expect(fs.readFileSync).toHaveBeenCalled();
            expect(res.send).toHaveBeenCalledWith('<html>qr</html>');
        });

        it('forwards filesystem errors to next', async () => {
            const error = new Error('ENOENT');
            fs.readFileSync.mockImplementation(() => {
                throw error;
            });
            const next = mockNext();

            await AuthenticateController.handleRoot(mockReq(), mockRes(), next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getQrCode', () => {
        it('sends the QR payload as text', async () => {
            AuthService.getQrCode.mockReturnValue('qr-string');
            const res = mockRes();

            await AuthenticateController.getQrCode(mockReq(), res, mockNext());

            expect(res.send).toHaveBeenCalledWith('qr-string');
        });
    });

    describe('checkStatus', () => {
        it('returns authenticated true', async () => {
            AuthService.isAuthenticated.mockResolvedValue(true);
            const res = mockRes();

            await AuthenticateController.checkStatus(mockReq(), res, mockNext());

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: { authenticated: true },
                })
            );
        });
    });

    describe('checkQrCodeAvailability', () => {
        it('includes the QR when available', async () => {
            AuthService.isQrCodeAvailable.mockReturnValue(true);
            AuthService.getQrCode.mockReturnValue('qr-string');
            const res = mockRes();

            await AuthenticateController.checkQrCodeAvailability(mockReq(), res, mockNext());

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: { qrCodeAvailable: true, qrCode: 'qr-string' },
                })
            );
        });

        it('omits the QR when unavailable', async () => {
            AuthService.isQrCodeAvailable.mockReturnValue(false);
            const res = mockRes();

            await AuthenticateController.checkQrCodeAvailability(mockReq(), res, mockNext());

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { qrCodeAvailable: false, qrCode: null },
                })
            );
        });
    });
});
