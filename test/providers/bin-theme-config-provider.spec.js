'use strict';

describe('binThemeConfig', function() {
    var binThemeConfig = undefined;

    describe('without additional module config', function() {
        beforeEach(module('bin.theme'));
        beforeEach(inject(function(_binThemeConfig_) {
            binThemeConfig = _binThemeConfig_;
        }));

        it('should have enabled dynamic styles', function() {
            expect(binThemeConfig.isDynamicStylesEnabled).toBe(true);
        });
    });

    describe('with module config to disable dynamic styles', function() {
        angular.module('test', ['bin.theme']).config(['binThemeConfigProvider', function(binThemeConfigProvider) {
            binThemeConfigProvider.disableDynamicStyles();
        }]);

        beforeEach(module('test'));
        beforeEach(inject(function(_binThemeConfig_) {
            binThemeConfig = _binThemeConfig_;
        }));

        it('should have disabled dynamic styles', function() {
            expect(binThemeConfig.isDynamicStylesEnabled).toBe(false);
        });
    })

});