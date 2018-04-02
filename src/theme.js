(function () {
    'use strict';
    angular.module('bin.theme', ['bin.theme.templates', 'binarta-applicationjs-angular1', 'config', 'toggle.edit.mode'])
        .service('binTheme', ['binarta', '$q', 'config', 'configWriter', binThemeService])
        .controller('colorPickerController', ['$rootScope', 'editModeRenderer', 'binTheme', colorPickerController])
        .run(['$rootScope', 'binTheme', function ($rootScope, theme) {
            if (!$rootScope.theme) $rootScope.theme = {};
            if (!$rootScope.theme.color) $rootScope.theme.color = {};
            theme.getPrimaryColor().then(function (color) {
                $rootScope.theme.color.primary = color;
            });
        }]);

    function binThemeService(binarta, $q, config, writer) {
        var self = this;
        this.predefinedColors = ['#6abd45', '#40b040', '#338d7b', '#dcda50', '#dcc450', '#dca850', '#dc9150', '#dc6950', '#b94379', '#7f3891', '#554398', '#3d6091'];
        var defaultColor = self.predefinedColors[0];

        this.getPrimaryColor = function () {
            var deferred = $q.defer();

            binarta.schedule(function () {
                binarta.application.config.findPublic('theme.primary.color', function (value) {
                    var c = defaultColor;
                    if (value == '') c = config.defaultPrimaryColor || defaultColor;
                    if (isValidHexColor(value)) c = value;
                    else if (isLegacyThemeOption(value)) {
                        var count = value.replace('theme-option-', '') - 1;
                        c = count <= self.predefinedColors.length ? self.predefinedColors[count] : defaultColor;
                    }
                    deferred.resolve(c);
                });
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
            color = normalizeHex(color);
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

        this.toRgb = function (hex) {
            hex = normalizeHex(hex);
            var f = parseInt(hex.slice(1), 16);
            return (f >> 16) + ',' + (f >> 8 & 0x00FF) + ',' + (f & 0x0000FF);
        };

        function normalizeHex(hex) {
            if (hex.length == 4) return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
            return hex;
        }

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
                template: '<bin-color-picker on-close="close()"></bin-color-picker>',
                scope: rendererScope
            });

            rendererScope.close = function () {
                editModeRenderer.close();
            };
        };
    }
})();