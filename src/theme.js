(function () {
    'use strict';
    angular.module('bin.theme', ['config', 'toggle.edit.mode'])
        .service('binTheme', ['$q', 'configReader', 'configWriter', binThemeService])
        .controller('colorPickerController', ['$rootScope', 'editModeRenderer', 'binTheme', colorPickerController])
        .run(['$rootScope', 'binTheme', function ($rootScope, theme) {
            if (!$rootScope.theme) $rootScope.theme = {};
            if (!$rootScope.theme.color) $rootScope.theme.color = {};
            theme.getPrimaryColor().then(function (color) {
                $rootScope.theme.color.primary = color;
            });
        }]);

    function binThemeService($q, reader, writer) {
        var self = this;
        this.predefinedColors = ['#6abd45','#40b040','#338d7b','#dcda50','#dcc450','#dca850','#dc9150','#dc6950','#b94379','#7f3891','#554398','#3d6091'];
        var defaultColor = self.predefinedColors[0];

        this.getPrimaryColor = function () {
            var deferred = $q.defer();

            reader({
                $scope: {},
                scope: 'public',
                key: 'theme.primary.color'
            }).then(function (result) {
                var c = defaultColor;
                if (isValidHexColor(result.data.value)) c = result.data.value;
                else if (isLegacyThemeOption(result.data.value)) {
                    var count = result.data.value.replace('theme-option-', '') - 1;
                    c = count <= self.predefinedColors.length ? self.predefinedColors[count] : defaultColor;
                }

                deferred.resolve(c);
            }, function () {
                deferred.resolve(defaultColor);
            });

            return deferred.promise;
        };

        this.updatePrimaryColor = function (color) {
            var deferred = $q.defer();

            if (!isValidHexColor(color)) {
                deferred.reject();
            } else {
                writer({
                    $scope: {},
                    scope: 'public',
                    key: 'theme.primary.color',
                    value: color
                }).then(function () {
                    deferred.resolve();
                }, function () {
                    deferred.reject();
                });
            }

            return deferred.promise;
        };

        this.shadeColor = function (color, percent) {
            if (color.length == 4) color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
            percent = percent / 100;
            var f = parseInt(color.slice(1), 16),
                t = percent < 0 ? 0 : 255,
                p = percent < 0 ? percent * -1 : percent,
                R = f >> 16,
                G = f >> 8 & 0x00FF,
                B = f & 0x0000FF,
                RR = 0x1000000 + (Math.round((t - R) * p) + R) * 0x10000,
                GG = (Math.round((t - G) * p) + G) * 0x100,
                BB = (Math.round((t - B) * p) + B);
            return "#" + (RR + GG + BB).toString(16).slice(1);
        };

        function isValidHexColor(color) {
            return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
        }

        function isLegacyThemeOption(color) {
            return /theme-option-[0-9]+/.test(color);
        }
    }

    function colorPickerController($rootScope, editModeRenderer, theme) {
        this.open = function () {
            var rendererScope = $rootScope.$new();

            editModeRenderer.open({
                template: '<form ng-submit="save()">' +
                '<div class="bin-menu-edit-body">' +

                '<div class="alert alert-danger" ng-show="rejected">' +
                '<i class="fa fa-exclamation-triangle"></i> ' +
                '<span i18n code="theme.color.picker.invalid.color" read-only ng-bind="::var"></span>' +
                '</div>' +

                '<h4 i18n code="theme.color.picker.select.title" read-only ng-bind="::var"></h4>' +
                '<div class="form-group">' +
                '<button type="button" class="color-picker-block" ng-class="{active: selectedColor == c}" ' +
                'ng-repeat="c in predefinedColors" ng-style="{backgroundColor: c, borderColor: c}" ' +
                'ng-click="selectColor(c)">' +
                '</button>' +
                '</div>' +

                '<hr>' +

                '<div class="form-group">' +
                '<table>' +
                '<tr>' +
                '<th style="padding-right: 15px;" i18n code="theme.color.picker.selected.color" read-only ng-bind="::var"></th>' +
                '<td>' +
                '<div class="input-group">' +
                '<span class="input-group-addon" ng-style="{backgroundColor: selectedColor}">' +
                '<span ng-hide="working"><i class="fa fa-fw"></i></span>' +
                '<span ng-show="working"><i class="fa fa-spinner fa-fw fa-spin"></i></span>' +
                '</span>' +
                '<input type="text" class="form-control" style="width: 100px;" ng-model="selectedColor">' +
                '</div>' +
                '</td>' +
                '</tr>' +
                '</table>' +
                '</div>' +
                '</div>' +
                '<div class="bin-menu-edit-actions">' +
                '<button type="submit" class="btn btn-primary" i18n code="clerk.menu.save.button" read-only ng-bind="::var"></button>' +
                '<button type="button" class="btn btn-default" ng-click="close()" i18n code="clerk.menu.close.button" read-only ng-bind="::var"></button>' +
                '</div>' +
                '</form>',
                scope: rendererScope
            });

            rendererScope.working = true;
            rendererScope.predefinedColors = theme.predefinedColors;

            theme.getPrimaryColor().then(function (color) {
                rendererScope.selectedColor = color;
                rendererScope.working = false;
            });

            rendererScope.close = function () {
                editModeRenderer.close();
            };

            rendererScope.selectColor = function (color) {
                rendererScope.selectedColor = color;
            };

            rendererScope.save = function () {
                rendererScope.working = true;
                rendererScope.rejected = false;

                theme.updatePrimaryColor(rendererScope.selectedColor).then(function () {
                    $rootScope.theme.color.primary = rendererScope.selectedColor;
                    editModeRenderer.close();
                }, function () {
                    rendererScope.rejected = true;
                    rendererScope.working = false;
                });
            };
        };
    }
})();