'use strict';

describe('ActivateCachedStylesOnSignin', function() {
    var styleService = undefined;
    var checkpoint = undefined;
    var localStorage = undefined;

    function initializeModule(configure) {
        beforeEach(module('bin.theme'));
        beforeEach(module(function($provide) {
            $provide.decorator('checkpoint', function($delegate) {
                spyOn($delegate.profile.eventRegistry, 'add').and.callThrough();
                return $delegate;
            })
        }));
        beforeEach(function() {
            if (configure) configure(angular.module('bin.theme'));
        });
        beforeEach(inject(function (_checkpoint_, _localStorage_, _styleService_) {
            checkpoint = _checkpoint_;
            localStorage = _localStorage_;
            styleService = _styleService_;

            spyOn(styleService, 'update');
            spyOn(styleService, 'reset');

            styleService.register('app-style', {href: 'app-style.css?123'})
        }));
    }

    afterEach(function() {
        localStorage.clear();
    });

    describe('without dynamic styles', function() {
        initializeModule(function(module) {
            module.config(function(binThemeConfigProvider) {
                binThemeConfigProvider.disableDynamicStyles();
            })
        });

        it('should not have installed event handlers on the profile', function() {
            expect(checkpoint.profile.eventRegistry.add).not.toHaveBeenCalled();
        })
    });

    describe('with dynamic styles', function() {
        initializeModule(function(module) {
            module.config(function(binThemeConfigProvider) {
                binThemeConfigProvider.enableDynamicStyles();
            })
        });

        describe('on user sign in', function() {
            beforeEach(function() {
                expect(checkpoint.profile.eventRegistry.add).toHaveBeenCalled();
                localStorage.setItem('binThemeCache', JSON.stringify({href:'app-style.css?123&compile&extra'}));
                checkpoint.profile.eventRegistry.notify('signedin');
            });

            it('should update the style service with the new href', function() {
                expect(styleService.update).toHaveBeenCalledWith('app-style', {href:'app-style.css?123&compile&extra'});
            });

            describe('and user signs out again', function() {
                beforeEach(function() {
                    checkpoint.profile.eventRegistry.notify('signedout');
                });

                it('should reset to the initial stylesheet', function() {
                    expect(styleService.reset).toHaveBeenCalledWith('app-style');
                });
            });
        });

        describe('on user sign in without cache', function() {
            beforeEach(function() {
                checkpoint.profile.eventRegistry.notify('signedin');
            });

            it('should not update the styleService', function() {
                expect(styleService.update).not.toHaveBeenCalled();
            });

            it('should make sure there is no entry in localStorage', function() {
                expect(localStorage.getItem('binThemeCache')).toBeNull();
            });
        });

        describe('on user sign in with cache but no href', function() {
            beforeEach(function() {
                localStorage.setItem('binThemeCache', JSON.stringify({ignored:'ignored'}));
                checkpoint.profile.eventRegistry.notify('signedin');
            });

            it('should not update the styleService', function() {
                expect(styleService.update).not.toHaveBeenCalled();
            });

            it('should make sure there is no entry in localStorage', function() {
                expect(localStorage.getItem('binThemeCache')).toBeNull();
            });
        });

        describe('on user sign in with cache but base segment of the href does not match', function() {
            beforeEach(function() {
                localStorage.setItem('binThemeCache', JSON.stringify({href:'app-style?456'}));
                checkpoint.profile.eventRegistry.notify('signedin');
            });

            it('should not update the styleService', function() {
                expect(styleService.update).not.toHaveBeenCalled();
            });

            it('should make sure there is no entry in localStorage', function() {
                expect(localStorage.getItem('binThemeCache')).toBeNull();
            });
        })
    });

});