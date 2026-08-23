const fs = require('fs-extra');
const path = require('path');

jest.mock('fs-extra', () => ({
    readJson: jest.fn(),
    writeJson: jest.fn(),
}));

const { isAuthenticated, writeAuthenticated } = require('../../../src/utils/common.util');

describe('common.util', () => {
    const statusPath = path.join(__dirname, '../../../status.json');

    beforeEach(() => {
        fs.readJson.mockReset();
        fs.writeJson.mockReset();
    });

    describe('isAuthenticated', () => {
        it('returns the authenticated flag from status.json', async () => {
            fs.readJson.mockResolvedValue({ authenticated: true });
            await expect(isAuthenticated()).resolves.toBe(true);
            expect(fs.readJson).toHaveBeenCalledWith(statusPath);
        });

        it('returns false when the file cannot be read', async () => {
            fs.readJson.mockRejectedValue(new Error('ENOENT'));
            await expect(isAuthenticated()).resolves.toBe(false);
        });
    });

    describe('writeAuthenticated', () => {
        it('persists the status payload', async () => {
            fs.writeJson.mockResolvedValue(undefined);
            await writeAuthenticated({ authenticated: false });
            expect(fs.writeJson).toHaveBeenCalledWith(statusPath, { authenticated: false });
        });

        it('swallows write errors', async () => {
            fs.writeJson.mockRejectedValue(new Error('EACCES'));
            await expect(writeAuthenticated({ authenticated: true })).resolves.toBeUndefined();
        });
    });
});
