describe('bin.theme', function () {
    var $rootScope, configReader, configWriter, configReaderDeferred, configWriterDeferred, editModeRenderer, theme;

    var predefinedColors = ['#6abd45','#40b040','#338d7b','#dcda50','#dcc450','#dca850','#dc9150','#dc6950','#b94379','#7f3891','#554398','#3d6091'];

    angular.module('config', [])
        .value('config', {})
        .factory('configReader', ['$q', function ($q) {
            configReaderDeferred = $q.defer();
            return jasmine.createSpy('configReader').and.returnValue(configReaderDeferred.promise);
        }])
        .factory('configWriter', ['$q', function ($q) {
            configWriterDeferred = $q.defer();
            return jasmine.createSpy('configWriter').and.returnValue(configWriterDeferred.promise);
        }]);

    angular.module('toggle.edit.mode', [])
        .service('editModeRenderer', function () {
            return jasmine.createSpyObj('editModeRenderer', ['open', 'close']);
        });

    beforeEach(module('bin.theme'));

    beforeEach(inject(function (_$rootScope_, _configReader_, _configWriter_, _editModeRenderer_, binTheme) {
        $rootScope = _$rootScope_;
        configReader = _configReader_;
        configWriter = _configWriter_;
        editModeRenderer = _editModeRenderer_;
        theme = binTheme;
    }));

    describe('on run', function () {
        it('put primary color on rootScope', function () {
            configReaderDeferred.resolve({data: {value: '#ccc'}});

            $rootScope.$digest();

            expect($rootScope.theme.color.primary).toEqual('#ccc');
        });
    });

    describe('theme service', function () {
        describe('on get primary color', function () {
            var color;
            beforeEach(function () {
                color = undefined;

                theme.getPrimaryColor().then(function (result) {
                    color = result;
                });
            });

            it('read primary theme color from config', function () {
                expect(configReader).toHaveBeenCalledWith({
                    $scope: {},
                    scope: 'public',
                    key: 'theme.primary.color'
                });
            });

            it('when no config value, use default color', function () {
                configReaderDeferred.reject();

                $rootScope.$digest();

                expect(color).toEqual(predefinedColors[0]);
            });

            [
                {actual: 'theme-option-1', expected: predefinedColors[0]},
                {actual: 'theme-option-2', expected: predefinedColors[1]},
                {actual: 'theme-option-3', expected: predefinedColors[2]},
                {actual: 'theme-option-4', expected: predefinedColors[3]},
                {actual: 'theme-option-5', expected: predefinedColors[4]},
                {actual: 'theme-option-6', expected: predefinedColors[5]},
                {actual: 'theme-option-7', expected: predefinedColors[6]},
                {actual: 'theme-option-8', expected: predefinedColors[7]},
                {actual: 'theme-option-9', expected: predefinedColors[8]},
                {actual: 'theme-option-10', expected: predefinedColors[9]},
                {actual: 'theme-option-11', expected: predefinedColors[10]},
                {actual: 'theme-option-12', expected: predefinedColors[11]},
                {actual: 'theme-option-13', expected: predefinedColors[12]},
                {actual: 'theme-option-14', expected: predefinedColors[0]},
                {actual: '#ffffff', expected: '#ffffff'},
                {actual: '#dcda50', expected: '#dcda50'},
                {actual: '#000', expected: '#000'},
                {actual: 'invalid', expected: predefinedColors[0]}
            ].forEach(function (test) {
                it('when config value is ' + test.actual + ', expect ' + test.expected, function () {
                    configReaderDeferred.resolve({data: {value: test.actual}});

                    $rootScope.$digest();

                    expect(color).toEqual(test.expected);
                });
            });
        });

        describe('on update primary color', function () {
            var resolved, rejected;

            describe('and color is valid', function () {
                var newColor = '#aabbcc';

                beforeEach(function () {
                    resolved = undefined;
                    rejected = undefined;

                    theme.updatePrimaryColor(newColor).then(function () {
                        resolved = true;
                    }, function () {
                        rejected = true;
                    });
                });

                it('config writer is called', function () {
                    expect(configWriter).toHaveBeenCalledWith({
                        $scope: {},
                        scope: 'public',
                        key: 'theme.primary.color',
                        value: newColor
                    });
                });

                describe('on success', function () {
                    beforeEach(function () {
                        configWriterDeferred.resolve();

                        $rootScope.$digest();
                    });

                    it('promise is resolved', function () {
                        expect(resolved).toBeTruthy();
                    });
                });

                describe('on reject', function () {
                    beforeEach(function () {
                        configWriterDeferred.reject();

                        $rootScope.$digest();
                    });

                    it('promise is rejected', function () {
                        expect(rejected).toBeTruthy();
                    });
                });
            });

            describe('and color is invalid', function () {
                var invalidColor = 'invalid';

                beforeEach(function () {
                    resolved = undefined;
                    rejected = undefined;

                    theme.updatePrimaryColor(invalidColor).then(function () {
                        resolved = true;
                    }, function () {
                        rejected = true;
                    });

                    $rootScope.$digest();
                });

                it('promise is rejected', function () {
                    expect(rejected).toBeTruthy();
                });
            });
        });

        describe('on shadeColor', function () {
            [
                {actual: '#abc', percentage: 0, expected: '#aabbcc'},
                {actual: '#3f83a3', percentage: 0, expected: '#3f83a3'},
                {actual: '#3f83a3', percentage: 10, expected: '#528fac'},
                {actual: '#3f83a3', percentage: 20, expected: '#659cb5'},
                {actual: '#3f83a3', percentage: 30, expected: '#79a8bf'},
                {actual: '#3f83a3', percentage: 40, expected: '#8cb5c8'},
                {actual: '#3f83a3', percentage: 50, expected: '#9fc1d1'},
                {actual: '#3f83a3', percentage: 60, expected: '#b2cdda'},
                {actual: '#3f83a3', percentage: 70, expected: '#c5dae3'},
                {actual: '#3f83a3', percentage: 80, expected: '#d9e6ed'},
                {actual: '#3f83a3', percentage: 90, expected: '#ecf3f6'},
                {actual: '#3f83a3', percentage: 100, expected: '#ffffff'},
                {actual: '#3f83a3', percentage: -10, expected: '#397693'},
                {actual: '#3f83a3', percentage: -20, expected: '#326982'},
                {actual: '#3f83a3', percentage: -30, expected: '#2c5c72'},
                {actual: '#3f83a3', percentage: -40, expected: '#264f62'},
                {actual: '#3f83a3', percentage: -50, expected: '#204252'},
                {actual: '#3f83a3', percentage: -60, expected: '#193441'},
                {actual: '#3f83a3', percentage: -70, expected: '#132731'},
                {actual: '#3f83a3', percentage: -80, expected: '#0d1a21'},
                {actual: '#3f83a3', percentage: -90, expected: '#060d10'},
                {actual: '#3f83a3', percentage: -100, expected: '#000000'}
            ].forEach(function (test) {
                it('shade color by ' + test.percentage * 100 + ' percent', function () {
                    expect(theme.shadeColor(test.actual, test.percentage)).toEqual(test.expected);
                });
            });
        });

        describe('on toRgb', function () {
            [
                {actual: '#abc', expected: '170,187,204'},
                {actual: '#ffffff', expected: '255,255,255'},
                {actual: '#000000', expected: '0,0,0'},
                {actual: '#3f83a3', expected: '63,131,163'}
            ].forEach(function (test) {
                it('convert color ' + test.actual + ' to rgb', function () {
                    expect(theme.toRgb(test.actual)).toEqual(test.expected);
                });
            });
        });
    });

    describe('colorPicker controller', function () {
        var ctrl;

        beforeEach(inject(function ($controller) {
            ctrl = $controller('colorPickerController');
        }));

        describe('on open', function () {
            beforeEach(function () {
                ctrl.open();

                configReaderDeferred.resolve({data: {value: '#ccc'}});
                $rootScope.$digest();
            });

            it('editMode renderer is opened', function () {
                expect(editModeRenderer.open).toHaveBeenCalledWith({
                    template: jasmine.any(String),
                    scope: jasmine.any(Object)
                });
            });

            describe('with renderer scope', function () {
                var scope;

                beforeEach(function () {
                    scope = editModeRenderer.open.calls.mostRecent().args[0].scope;
                });

                it('predefined colors are available', function () {
                    expect(scope.predefinedColors).toEqual(predefinedColors);
                });

                it('initialize selected color', function () {
                    expect(scope.selectedColor).toEqual('#ccc');
                });

                it('when new color is selected', function () {
                    scope.selectColor('#ffffff');

                    expect(scope.selectedColor).toEqual('#ffffff');
                });

                describe('on save', function () {
                    describe('with valid color', function () {
                        var newColor = '#aabbcc';

                        beforeEach(function () {
                            scope.selectedColor = newColor;
                            scope.save();
                        });

                        it('working is on scope', function () {
                            expect(scope.working).toBeTruthy();
                        });

                        describe('on success', function () {
                            beforeEach(function () {
                                configWriterDeferred.resolve();

                                $rootScope.$digest();
                            });

                            it('update rootScope with new value', function () {
                                expect($rootScope.theme.color.primary).toEqual(newColor);
                            });

                            it('editModeRenderer is closed', function () {
                                expect(editModeRenderer.close).toHaveBeenCalled();
                            });
                        });

                        describe('on reject', function () {
                            beforeEach(function () {
                                configWriterDeferred.reject();

                                $rootScope.$digest();
                            });

                            it('rejected is on scope', function () {
                                expect(scope.rejected).toBeTruthy();
                            });

                            it('editModeRenderer is not closed', function () {
                                expect(editModeRenderer.close).not.toHaveBeenCalled();
                            });

                            it('working is false', function () {
                                expect(scope.working).toBeFalsy();
                            });
                        });
                    });

                    describe('with invalid color', function () {
                        beforeEach(function () {
                            scope.selectedColor = 'invalid';
                            scope.save();

                            $rootScope.$digest();
                        });

                        it('rejected is on scope', function () {
                            expect(scope.rejected).toBeTruthy();
                        });

                        it('working is false', function () {
                            expect(scope.working).toBeFalsy();
                        });
                    });
                });

                it('on close, editModeRenderer is closed', function () {
                    scope.close();

                    expect(editModeRenderer.close).toHaveBeenCalled();
                });
            });
        });
    });
});