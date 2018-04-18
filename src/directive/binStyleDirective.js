(function(angular) {
    'use strict';
    angular.module('bin.theme')
        .directive('binStyle', ['styleService', BinStyleDirective]);

    function BinStyleDirective(styleService) {
        return {
            restrict:'A',
            scope: {
                id: '@id'
            },
            link: function($scope, $element) {
                styleService.register($scope.id, {
                    href: $element.attr('href')
                });

                function isEventForScope(ctx) {
                    return ctx.id === $scope.id;
                }

                styleService.events.observeIf(isEventForScope, {
                    onStyleChange: function(ctx) {
                        $element.attr('href', ctx.href);
                    }
                });
            }
        }
    };
})(angular);