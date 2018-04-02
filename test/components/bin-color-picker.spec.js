'use strict';
describe('binColorPicker', function() {
    var $q = undefined;
    var $rootScope = undefined;
    var component = undefined;
    var theme = undefined;
    var onClose = undefined;

    beforeEach(module('bin.theme'));

    beforeEach(inject(function($componentController, _$q_, _$rootScope_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        theme = {
            predefinedColors: ['#000000', '#ffffff'],
            getPrimaryColor: jasmine.createSpy('getPrimaryColor'),
            updatePrimaryColor: jasmine.createSpy('updatePrimaryColor')
        };
        onClose = jasmine.createSpy('onClose');
        component = $componentController('binColorPicker', {binTheme: theme}, {onClose:onClose});
    }));

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
                beforeEach(function() {
                    component.selectColor('#ffffff');
                });
    
                it('should set the selected color', function() {
                    expect(component.selectedColor).toEqual('#ffffff');
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