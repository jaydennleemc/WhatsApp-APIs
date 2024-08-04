const { Client } = require('whatsapp-web.js');
const { writeAuthenticated } = require('./util/utils');

let clientReady = false;
let qrCode = '';
const client = new Client({
    puppeteer: {
        args: ['--no-sandbox'],
    },
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrCode = qr;
});

client.on('ready', () => {
    console.log('Client is ready!');
    clientReady = true;
    writeAuthenticated({
        authenticated: true,
    });
});

client.on('disconnected', (reason) => {
    console.log('*** Client was logged out', reason);
    clientReady = false;
    writeAuthenticated({
        authenticated: false,
    });
});

client.on('message', (msg) => {
    console.log('MESSAGE RECEIVED', msg);
});

const InitWhatsAppClient = () => {
    console.log('Init WhatsApp Web Client');
    client.initialize();
    writeAuthenticated({
        authenticated: false,
    });
};

const sendWhatsAppMessage = async (number, message) => {
    if (!clientReady) {
        throw new Error('Client is not ready');
    }
    return client.sendMessage(`${number}@.us`, message);
};

const getQrCode = () => {
    return qrCode;
};

module.exports = {
    InitWhatsAppClient,
    sendWhatsAppMessage,
    getQrCode,
};
