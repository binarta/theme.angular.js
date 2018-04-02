(function(angular) {
    'use strict';
    angular.module('bin.theme')
        .component('binColorPicker', new BinColorPickerComponent())
        .controller('binColorPickerController', ['$rootScope', 'binTheme', BinColorPickerController])
    ;

    function BinColorPickerComponent() {
        this.templateUrl = 'bin-color-picker.html';
        this.controllerAs = 'picker';
        this.controller = 'binColorPickerController';
        this.bindings = {
            'onClose': '&onClose'
        }
    }

    function BinColorPickerController($rootScope, theme) {
        this.$rootScope = $rootScope;
        this.theme = theme;
    }

    BinColorPickerController.prototype.$onInit = function() {
        var self = this;

        this.working = true;
        this.predefinedColors = this.theme.predefinedColors;
        this.theme.getPrimaryColor().then(function (color) {
            self.selectedColor = color;
            self.working = false;
        });
    }

    BinColorPickerController.prototype.close = function() {
        this.onClose();
    }

    BinColorPickerController.prototype.selectColor = function(color) {
        this.selectedColor = color;
    }

    BinColorPickerController.prototype.save = function() {
        var self = this;

        this.working = true;
        this.rejected = false;

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