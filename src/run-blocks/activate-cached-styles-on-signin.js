(function(angular) {
    'use strict';
    angular.module('bin.theme').run(['checkpoint', 'localStorage', 'styleService', 'binThemeConfig', ActivateCachedStylesOnSignin]);

    function ActivateCachedStylesOnSignin(checkpoint, localStorage, styleService, binThemeConfig) {
        if (binThemeConfig.isDynamicStylesEnabled) {
            checkpoint.profile.eventRegistry.add({
                signedin: function () {
                    var cache = JSON.parse(localStorage.getItem('binThemeCache'));
                    if (cache) {
                        var href = cache.href || '';
                        if (isCachedHrefForSameDefault(href))
                            styleService.update('app-style', {
                                href: href
                            });
                        else
                            localStorage.removeItem('binThemeCache')
                    }
                },
                signedout: function () {
                    styleService.reset('app-style');
                }
            })
        }

        function isCachedHrefForSameDefault(cachedHref) {
            var defaultHref = styleService.defaults['app-style'].href;
            return cachedHref.indexOf(defaultHref) > -1;
        }
    }

})(angular);