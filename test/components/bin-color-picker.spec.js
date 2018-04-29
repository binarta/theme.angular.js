'use strict';
describe('binColorPicker', function() {
    var $q = undefined;
    var $rootScope = undefined;
    var component = undefined;
    var theme = undefined;
    var onClose = undefined;
    var styleService = undefined;
    var binThemeConfig = undefined;
    var localStorage = undefined;

    beforeEach(module('bin.theme'));

    beforeEach(inject(function($componentController, _$q_, _$rootScope_, _binThemeConfig_, _localStorage_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        binThemeConfig = _binThemeConfig_;
        localStorage = _localStorage_;
        theme = {
            predefinedColors: ['#000000', '#ffffff'],
            getPrimaryColor: jasmine.createSpy('getPrimaryColor'),
            updatePrimaryColor: jasmine.createSpy('updatePrimaryColor')
        };
        styleService = {
            defaults: {},
            update: jasmine.createSpy('styleService#update')
        };
        onClose = jasmine.createSpy('onClose');
        component = $componentController('binColorPicker', {binTheme: theme, styleService: styleService}, {onClose:onClose});
    }));

    afterEach(function() {
        localStorage.clear();
    });

    it('should expose the isDynamicStylesEnabled flag from the config', function() {
        expect(component.isDynamicStylesEnabled).toEqual(binThemeConfig.isDynamicStylesEnabled);
    });

    describe('$onInit', function() {
        var getPrimaryColorDeferred = undefined;

        beforeEach(function() {
            getPrimaryColorDeferred = $q.defer();
            theme.getPrimaryColor.and.returnValue(getPrimaryColorDeferred.promise);
            component.$onInit();
        });

        it('should be flagged as working', function() {
            expect(component.working).toBe(true);
        });

        it('should expose the the predefined colors', function() {
            expect(component.predefinedColors).toEqual(theme.predefinedColors);
        });

        it('should fetch the primary color', function() {
            expect(theme.getPrimaryColor).toHaveBeenCalled();
        });

        describe('and primary color was loaded', function() {
            beforeEach(function() {
                getPrimaryColorDeferred.resolve('#000000');
                $rootScope.$digest();
            });

            it('should set the selected color', function() {
                expect(component.selectedColor).toEqual('#000000');
            });

            it('should be flagged as no longer working', function() {
                expect(component.working).toBe(false);
            });

            describe('selectColor', function() {
                var deferred = undefined;

                beforeEach(function() {
                    deferred = $q.defer();
                    styleService.defaults['app-style'] = {
                        href: 'href'
                    };
                    styleService.update.and.returnValue(deferred.promise);
                    component.selectColor('#ffffff');
                });
    
                it('should set the selected color', function() {
                    expect(component.selectedColor).toEqual('#ffffff');
                });

                it('should update app-style href', function() {
                    expect(styleService.update).toHaveBeenCalledWith('app-style', {
                        href: 'href?compile&primaryColor=%23ffffff'
                    });
                });

                it('should flag the component as working', function() {
                    expect(component.working).toBe(true);
                });

                it('should support the default href to already have a query param', function() {
                    styleService.defaults['app-style'] = {
                        href: 'href?otherParam=this'
                    };
                    component.selectColor('#ffffff');
                    expect(styleService.update).toHaveBeenCalledWith('app-style', {
                        href: 'href?otherParam=this&compile&primaryColor=%23ffffff'
                    });
                });

                describe('and the update is finished', function() {
                    beforeEach(function() {
                        deferred.resolve();
                        $rootScope.$digest()
                    });

                    it('should flag the component as no longer working', function() {
                        expect(component.working).toBe(false);
                    })
                });

                describe('save', function() {
                    var updatePrimaryColorDeferred = undefined;

                    beforeEach(function() {
                        updatePrimaryColorDeferred = $q.defer();
                        theme.updatePrimaryColor.and.returnValue(updatePrimaryColorDeferred.promise);
                        component.save();
                    });
    
                    it('should be flagged as working', function() {
                        expect(component.working).toBe(true);
                    });

                    it('should be flagged as not rejected', function() {
                        expect(component.rejected).toBe(false);
                    });

                    it('should store the new href in localStorage', function() {
                        var cache = JSON.parse(localStorage.getItem('binThemeCache'));
                        expect(cache.href).toEqual('href?compile&primaryColor=%23ffffff');
                    });

                    it('should call updatePrimaryColor on theme service', function() {
                        expect(theme.updatePrimaryColor).toHaveBeenCalledWith(component.selectedColor);
                    });

                    describe('and update was successful', function() {
                        beforeEach(function() {
                            onClose.calls.reset();
                            updatePrimaryColorDeferred.resolve();
                            $rootScope.$digest();
                        });

                        it('should no longer be marked as working', function() {
                            expect(component.working).toBe(false);
                        });

                        it('should expose the new primary color on the rootscope', function() {
                            expect($rootScope.theme.color.primary).toEqual(component.selectedColor);
                        });

                        it('should have emitted an onClose event', function() {
                            expect(onClose).toHaveBeenCalled();
                        });
                    });

                    describe('and update failed', function() {
                        beforeEach(function() {
                            updatePrimaryColorDeferred.reject();
                            $rootScope.$digest();
                        });

                        it('should mark the component as rejected', function() {
                            expect(component.rejected).toBe(true);
                        });

                        it('should mark the component as no longer working', function() {
                            expect(component.working).toBe(false);
                        });
                    })
                })
            });

            describe('selectColor with disabled dynamic styles', function() {
                beforeEach(function() {
                    binThemeConfig.disableDynamicStyles();
                    component.selectColor('#ffffff');
                });

                it('should not have flagged the component as working', function() {
                    expect(component.working).toBe(false);
                });

                it('should not update the styles', function() {
                    expect(styleService.update).not.toHaveBeenCalled();
                });

                describe('and save', function() {
                    beforeEach(function() {
                        theme.updatePrimaryColor.and.returnValue($q.when());
                        component.save();
                    });

                    it('should not store anything in localStorage', function() {
                        expect(localStorage.getItem('binThemeCache')).toBeNull();
                    })
                })
            })
        });


        describe('close', function() {
            beforeEach(function() {
                component.close();
            });

            it('should emit the onClose event', function() {
                expect(onClose).toHaveBeenCalled();
            })
        })
    })
})