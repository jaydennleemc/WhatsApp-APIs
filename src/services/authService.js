const { getQrCode: clientGetQrCode } = require('../whatsappClient');
const { isAuthenticated: utilIsAuthenticated } = require('../utils/utils');
const { AppError } = require('../middleware/errorHandler');
const { logInfo, logError, logDebug } = require('../utils/logger');

class AuthService {
    /**
     * Get QR code for WhatsApp authentication
     * @returns {string} QR code string
     */
    static getQrCode() {
        try {
            logInfo('Retrieving QR code for authentication');
            
            // Get QR code from the client
            const qrCode = clientGetQrCode();
            if (!qrCode) {
                throw new AppError('QR code is not available. Please try again.', 400, 'fail');
            }
            return qrCode;
        } catch (error) {
            logError('Error getting QR code', { error: error.message });
            
            if (error instanceof AppError) {
                throw error;
            } else {
                throw new AppError(
                    error.message || 'Failed to get QR code for authentication',
                    500,
                    'error'
                );
            }
        }
    }

    /**
     * Check if WhatsApp is authenticated
     * @returns {Promise<boolean>} Authentication status
     */
    static async isAuthenticated() {
        try {
            logDebug('Checking authentication status');
            const authenticated = await utilIsAuthenticated();
            logInfo('Authentication status checked', { authenticated });
            return authenticated;
        } catch (error) {
            logError('Error checking authentication status', { error: error.message });
            
            if (error instanceof AppError) {
                throw error;
            } else {
                throw new AppError(
                    error.message || 'Failed to check authentication status',
                    500,
                    'error'
                );
            }
        }
    }
}

module.exports = AuthService;