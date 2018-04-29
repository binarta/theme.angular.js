(function(angular) {
    'use strict';
    angular.module('bin.theme').provider('binThemeConfig', [BinThemeConfigProvider]);

    function BinThemeConfigProvider() {
        this.enableDynamicStyles();
    }

    BinThemeConfigProvider.prototype.enableDynamicStyles = function() {
        this.isDynamicStylesEnabled = true;
    };

    BinThemeConfigProvider.prototype.disableDynamicStyles = function() {
        this.isDynamicStylesEnabled = false;
    };

    BinThemeConfigProvider.prototype.$get = function() {
        return this;
    }
})(angular);