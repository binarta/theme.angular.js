(function(angular) {
    'use strict';
    angular.module('bin.theme')
        .component('binColorPicker', new BinColorPickerComponent())
        .controller('binColorPickerController', ['$rootScope', 'binTheme', 'styleService', 'localStorage', 'binThemeConfig', BinColorPickerController])
    ;

    function BinColorPickerComponent() {
        this.templateUrl = 'bin-color-picker.html';
        this.controllerAs = 'picker';
        this.controller = 'binColorPickerController';
        this.bindings = {
            'onClose': '&onClose'
        }
    }

    function BinColorPickerController($rootScope, theme, styleService, localStorage, binThemeConfig) {
        this.$rootScope = $rootScope;
        this.theme = theme;
        this.styleService = styleService;
        this.localStorage = localStorage;
        this.binThemeConfig = binThemeConfig;

        this.isDynamicStylesEnabled = binThemeConfig.isDynamicStylesEnabled;
    }

    BinColorPickerController.prototype.$onInit = function() {
        var self = this;

        this.working = true;
        this.predefinedColors = this.theme.predefinedColors;
        this.theme.getPrimaryColor().then(function (color) {
            self.selectedColor = color;
            self.working = false;
        });
    };

    BinColorPickerController.prototype.close = function() {
        this.onClose();
    };

    BinColorPickerController.prototype.selectColor = function(color) {
        this.selectedColor = color;
        if (this.binThemeConfig.isDynamicStylesEnabled)
            this.hotSwapStyles(color);
    };

    BinColorPickerController.prototype.hotSwapStyles = function(color) {
        var newHref = this.toNewHref(color);
        this.working = true;
        this.styleService.update('app-style', {
            href: newHref
        }).then(function() {
            this.working = false;
        }.bind(this));
    };

    BinColorPickerController.prototype.toNewHref = function(color) {
        var defaultHref = this.styleService.defaults['app-style'].href;
        if (defaultHref.indexOf('?') === -1)
            defaultHref += '?';
        else
            defaultHref+= '&';
        return defaultHref + 'compile&primaryColor='+ color.replace('#', '%23');
    };

    BinColorPickerController.prototype.save = function() {
        var self = this;

        this.working = true;
        this.rejected = false;

        if (this.binThemeConfig.isDynamicStylesEnabled) {
            var newHref = this.toNewHref(this.selectedColor);
            this.localStorage.setItem('binThemeCache', JSON.stringify({href: newHref}));
        }

        this.theme.updatePrimaryColor(this.selectedColor).then(function () {
            self.$rootScope.theme.color.primary = self.selectedColor;
            self.close();
        }).catch(function() {
            self.rejected = true;
        }).finally(function() {
            self.working = false;
        });
    }
})(angular);