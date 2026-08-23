const os = require('os');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.LOG_PATH = path.join(os.tmpdir(), 'whatsapp-api-jest-logs');
process.env.BASE_PATH = '';
process.env.BUILD_BASE_PATH = '';
process.env.WHATSAPP_CLIENT_NAME = 'whatsapp-api-test';
