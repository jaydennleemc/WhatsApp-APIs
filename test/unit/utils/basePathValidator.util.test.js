const { validateBasePath, normalizeBasePath } = require('../../../src/utils/basePathValidator.util');

describe('basePathValidator.util', () => {
    describe('validateBasePath', () => {
        it('allows empty and well-formed prefixes', () => {
            expect(validateBasePath('')).toEqual({ isValid: true, error: null });
            expect(validateBasePath(undefined)).toEqual({ isValid: true, error: null });
            expect(validateBasePath('/wa')).toEqual({ isValid: true, error: null });
            expect(validateBasePath('/')).toEqual({ isValid: true, error: null });
        });

        it('requires a leading slash', () => {
            expect(validateBasePath('wa').isValid).toBe(false);
            expect(validateBasePath('wa').error).toMatch(/must start with/);
        });

        it('rejects a trailing slash on non-root paths', () => {
            expect(validateBasePath('/wa/').isValid).toBe(false);
        });

        it('rejects spaces and quotes', () => {
            expect(validateBasePath('/wa path').isValid).toBe(false);
            expect(validateBasePath('/wa"x').isValid).toBe(false);
        });

        it('rejects paths longer than 255 characters', () => {
            expect(validateBasePath('/' + 'a'.repeat(255)).isValid).toBe(false);
        });
    });

    describe('normalizeBasePath', () => {
        it('maps empty and root to empty string', () => {
            expect(normalizeBasePath('')).toBe('');
            expect(normalizeBasePath('/')).toBe('');
            expect(normalizeBasePath(null)).toBe('');
        });

        it('adds a leading slash and strips a trailing one', () => {
            expect(normalizeBasePath('wa')).toBe('/wa');
            expect(normalizeBasePath('/wa/')).toBe('/wa');
            expect(normalizeBasePath('/wa/api/')).toBe('/wa/api');
        });
    });
});
