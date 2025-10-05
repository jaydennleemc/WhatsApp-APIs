const AuthService = require('../services/authService');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccessResponse } = require('../utils/errors');
const fs = require('fs');
const path = require('path');

class AuthenticateController {
    static async isAuthenticated(req, res, next) {
        try {
            const authenticated = await AuthService.isAuthenticated();
            if (authenticated) {
                return sendSuccessResponse(res, 200, 'WhatsApp authenticated', { authenticated });
            } else {
                return sendSuccessResponse(res, 200, 'WhatsApp not authenticated', { authenticated });
            }
        } catch (error) {
            next(error); // Pass error to error handling middleware
        }
    }

    static async authWhatsApp(req, res, next) {
        try {
            const qrcodeStr = AuthService.getQrCode();
            
            // Read the template HTML file
            const templatePath = path.join(__dirname, '../../index.html');
            let html = fs.readFileSync(templatePath, 'utf8');
            
            // Replace the QR code placeholder in the JavaScript with the actual QR code
            html = html.replace(
                'text: "https://webisora.com",',
                `text: "${qrcodeStr}",`
            );
            
            // Send the modified HTML
            res.send(html);
        } catch (error) {
            next(error); // Pass error to error handling middleware
        }
    }
}

module.exports = AuthenticateController;
