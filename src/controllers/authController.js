const AuthService = require('../services/authService');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccessResponse } = require('../utils/errors');
const fs = require('fs');
const path = require('path');

class AuthenticateController {
    static async handleRoot(req, res, next) {
        try {
            // The HTML file contains all the necessary logic to check authentication status
            // and display the appropriate content (QR code or authenticated message)
            const templatePath = path.join(__dirname, '../../index.html');
            const html = fs.readFileSync(templatePath, 'utf8');
            
            res.send(html);
        } catch (error) {
            next(error); // Pass error to error handling middleware
        }
    }
    
    // Get QR code endpoint
    static async getQrCode(req, res, next) {
        try {
            const qrCode = AuthService.getQrCode();
            res.send(qrCode);
        } catch (error) {
            next(error);
        }
    }
    
    // Check authentication status endpoint
    static async checkStatus(req, res, next) {
        try {
            const authenticated = await AuthService.isAuthenticated();
            res.json({
                success: true,
                message: authenticated ? 'WhatsApp authenticated' : 'WhatsApp not authenticated',
                data: { authenticated },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Check QR code availability endpoint
    static async checkQrCodeAvailability(req, res, next) {
        try {
            const qrCodeAvailable = AuthService.isQrCodeAvailable();
            const qrCode = qrCodeAvailable ? AuthService.getQrCode() : null;
            res.json({
                success: true,
                data: { 
                    qrCodeAvailable: !!qrCodeAvailable,  // Ensure it's a boolean
                    qrCode: qrCodeAvailable ? qrCode : null
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthenticateController;