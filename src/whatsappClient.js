const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const { writeAuthenticated } = require('./utils/common.util');
const { logInfo, logError, logDebug } = require('./utils/logger.util');
const { cleanupTempFile } = require('./utils/media.utils');

let clientReady = false;
let qrCode = '';
let clientInitializing = false;
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'whatsapp-api', // Unique client session name
        dataPath: './session-data', // Directory to store session data
    }),
    puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined, // Use system Chromium
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-ipc-flooding-protection',
            '--disable-background-networking',
            '--disable-extensions',
            '--disable-default-apps',
            '--disable-component-extensions-with-background-pages',
            '--disable-features=TranslateUI',
            '--disable-hang-monitor',
            '--disable-prompt-on-repost',
            '--disable-sync',
            '--disable-features=TranslateUI,BlinkGenPropertyTrees',
        ],
    },
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/' + (Math.random() > 0.5 ? 'fiber' : 'titanium'),
    },
});

client.on('qr', (qr) => {
    logInfo('QR code received for authentication');
    qrCode = qr;
});

client.on('authenticated', () => {
    logInfo('WhatsApp authentication successful');
    writeAuthenticated({
        authenticated: true,
    });
});

client.on('auth_failure', (message) => {
    logError('WhatsApp authentication failure', { error: message });
    writeAuthenticated({
        authenticated: false,
    });
    clientReady = false;
});

client.on('ready', () => {
    logInfo('WhatsApp client is ready');
    clientReady = true;
    clientInitializing = false;
    writeAuthenticated({
        authenticated: true,
    });
});

client.on('disconnected', (reason) => {
    logInfo('WhatsApp client disconnected', { reason });
    clientReady = false;
    clientInitializing = false;
    writeAuthenticated({
        authenticated: false,
    });
});

client.on('change_state', (state) => {
    logDebug('WhatsApp connection state changed', { state });
    if (state === 'CONFLICT') {
        // When conflict state occurs, the client has been logged out from another device
        clientReady = false;
        writeAuthenticated({
            authenticated: false,
        });
    }
});

client.on('message', (msg) => {
    logDebug('Message received', {
        from: msg.from,
        body: msg.body ? msg.body.substring(0, 50) + '...' : 'media/message',
    });
});

client.on('message_ack', (msg, ack) => {
    logDebug('Message acknowledgment received', { messageId: msg.id._serialized, ack });
});

const InitWhatsAppClient = async () => {
    if (clientInitializing) {
        logInfo('WhatsApp client is already initializing');
        return;
    }

    logInfo('Initializing WhatsApp Web Client');
    clientInitializing = true;

    try {
        await client.initialize();
        // Don't set authentication status here - let events handle it
        logInfo('WhatsApp client initialized successfully');
    } catch (error) {
        logError('Error initializing WhatsApp client', { error: error.message });
        clientInitializing = false;
        writeAuthenticated({
            authenticated: false,
        });
    }
};

const sendWhatsAppMessage = async (number, message, options = {}) => {
    if (!clientReady) {
        const error = new Error('Client is not ready');
        logError('Failed to send message - client not ready', { number, message: message?.substring(0, 50) + '...' });
        throw error;
    }

    // Validate and format the phone number
    let formattedNumber = number.toString().replace(/\D/g, ''); // Remove non-digit characters

    // Ensure the number starts with the international prefix (+)
    if (!formattedNumber.startsWith('+')) {
        // Add '+' prefix if not present
        formattedNumber = '+' + formattedNumber;
    }

    // Additional WhatsApp-specific formatting: remove the '+' and add '@c.us' suffix for regular numbers
    // WhatsApp Web JS expects numbers in the format 'phonenumber@c.us'
    let whatsappNumber = formattedNumber.replace('+', '') + '@c.us';

    try {
        const response = await client.sendMessage(whatsappNumber, message, options);
        logInfo('Message sent successfully', {
            messageId: response.id._serialized,
            to: formattedNumber,
            message: message?.substring(0, 50) + '...',
        });
        return response;
    } catch (error) {
        logError('Error sending WhatsApp message', {
            error: error.message,
            number: formattedNumber,
            message: message?.substring(0, 50) + '...',
        });
        throw error;
    }
};

const sendWhatsAppMedia = async (number, messageMedia, options = {}) => {
    if (!clientReady) {
        const error = new Error('Client is not ready');
        logError('Failed to send media - client not ready', { number, mediaType: messageMedia.mimetype });
        throw error;
    }

    // Validate and format the phone number
    let formattedNumber = number.toString().replace(/\D/g, ''); // Remove non-digit characters

    // Ensure the number starts with the international prefix (+)
    if (!formattedNumber.startsWith('+')) {
        // Add '+' prefix if not present
        formattedNumber = '+' + formattedNumber;
    }

    // Additional WhatsApp-specific formatting: remove the '+' and add '@c.us' suffix for regular numbers
    // WhatsApp Web JS expects numbers in the format 'phonenumber@c.us'
    let whatsappNumber = formattedNumber.replace('+', '') + '@c.us';

    // Special handling for video files to prevent evaluation errors
    if (messageMedia.mimetype && messageMedia.mimetype.startsWith('video/')) {
        // For video files, we might need to add specific options
        options.sendMediaAsDocument = options.sendMediaAsDocument || false; // Default to sending as video
    }

    try {
        const response = await client.sendMessage(whatsappNumber, messageMedia, options);
        logInfo('Media sent successfully', {
            messageId: response.id._serialized,
            to: formattedNumber,
            mediaType: messageMedia.mimetype,
            filename: messageMedia.filename,
        });
        return response;
    } catch (error) {
        logError('Error sending WhatsApp media', {
            error: error.message,
            number: formattedNumber,
            mediaType: messageMedia.mimetype,
            filename: messageMedia.filename,
            stack: error.stack,
        });

        // Provide more specific error message for evaluation failures
        if (error.message && error.message.includes('Evaluation failed')) {
            throw new Error(
                `Failed to send media: ${error.message}. This error often occurs with video files that use unsupported codecs or have other format incompatibilities. Ensure your video uses H.264 codec in an MP4 container.`
            );
        }

        throw error;
    }
};

const getQrCode = () => {
    logDebug('Getting QR code', { qrCode });
    return qrCode;
};

const isQrCodeAvailable = () => {
    logDebug('Checking QR code availability', { qrCode });
    const available = qrCode && qrCode.length > 0;
    logDebug('QR code availability checked', { available });
    return available;
};

module.exports = {
    InitWhatsAppClient,
    sendWhatsAppMessage,
    sendWhatsAppMedia,
    getQrCode,
    isQrCodeAvailable,
};
