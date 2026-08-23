const BasePathConfig = require('../../../src/models/basePath.model');

describe('BasePathConfig', () => {
    it('normalizes on construct', () => {
        expect(new BasePathConfig().getBasePath()).toBe('');
        expect(new BasePathConfig('/').getBasePath()).toBe('');
        expect(new BasePathConfig('wa').getBasePath()).toBe('/wa');
        expect(new BasePathConfig('/wa/').getBasePath()).toBe('/wa');
    });

    it('updates via setBasePath', () => {
        const config = new BasePathConfig();
        config.setBasePath('/api/v1/');
        expect(config.getBasePath()).toBe('/api/v1');
        expect(config.isConfigured()).toBe(true);
    });

    it('reports unconfigured when empty', () => {
        expect(new BasePathConfig().isConfigured()).toBeFalsy();
    });

    describe('validateBasePath', () => {
        it('allows empty and slash-prefixed paths', () => {
            expect(BasePathConfig.validateBasePath('')).toBe(true);
            expect(BasePathConfig.validateBasePath('/wa')).toBe(true);
        });

        it('rejects missing slash and control characters', () => {
            expect(BasePathConfig.validateBasePath('wa')).toBe(false);
            expect(BasePathConfig.validateBasePath('/wa<x>')).toBe(false);
        });
    });
});
