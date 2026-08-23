/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/test'],
    testMatch: ['**/*.test.js'],
    setupFiles: ['<rootDir>/test/setup.js'],
    setupFilesAfterEnv: ['<rootDir>/test/setupAfterEnv.js'],
    clearMocks: true,
    restoreMocks: true,
    collectCoverageFrom: ['src/**/*.js'],
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: ['/node_modules/'],
    verbose: true,
};
