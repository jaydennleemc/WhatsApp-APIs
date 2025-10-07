const { Client, LocalAuth } = require('whatsapp-web.js');
const { writeAuthenticated } = require('./utils/utils');
const { logInfo, logError, logDebug } = require('./utils/logger');

let clientReady = false;
let qrCode = '';
let clientInitializing = false;
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "whatsapp-api", // Unique client session name
        dataPath: "./session-data" // Directory to store session data
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
            '--disable-features=TranslateUI,BlinkGenPropertyTrees'
        ]
    },
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/' + (Math.random() > 0.5 ? 'fiber' : 'titanium')
    }
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
        body: msg.body ? msg.body.substring(0, 50) + '...' : 'media/message' 
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
        writeAuthenticated({
            authenticated: false,
        });
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
    
    try {
        const response = await client.sendMessage(formattedNumber, message, options);
        logInfo('Message sent successfully', { 
            messageId: response.id._serialized, 
            to: formattedNumber,
            message: message?.substring(0, 50) + '...' 
        });
        return response;
    } catch (error) {
        logError('Error sending WhatsApp message', { 
            error: error.message, 
            number: formattedNumber,
            message: message?.substring(0, 50) + '...'
        });
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
    getQrCode,
    isQrCodeAvailable,
};
