const fs = require('fs-extra');
const path = require('path');

async function isAuthenticated() {
    try {
        const status = await fs.readJson(path.join(__dirname, '../../status.json'));
        return status.authenticated;
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function writeAuthenticated(data) {
    try {
        await fs.writeJson(path.join(__dirname, '../../status.json'), data);
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    isAuthenticated,
    writeAuthenticated,
};
