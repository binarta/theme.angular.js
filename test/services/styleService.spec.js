'use strict';

describe('styleService', function() {
    var styleService;
    var restService;
    var $q;
    var $rootScope;

    beforeEach(module('bin.theme'));

    beforeEach(inject(function(_styleService_, restServiceHandler, _$q_, _$rootScope_) {
        styleService = _styleService_;
        restService = restServiceHandler;
        $q = _$q_;
        $rootScope = _$rootScope_;
    }));

    describe('registering a style entry', function() {
        var events = undefined;

        beforeEach(function() {
            events = [];
            styleService.register('style-id', {
                href: 'href',
                media: 'media'
            });
            styleService.events.observeIf(function(ctx) { return ctx.id === 'style-id'}, {onStyleChange: function(ctx) {
                events.push(ctx);
            }});
        });

        it('should be possible to fetch the context from the service', function() {
            var context = styleService.styles['style-id'];
            expect(context).toEqual(jasmine.objectContaining({
                id: 'style-id',
                href: 'href',
                media: 'media'
            }));
        });

        it('should refuse to register the same id again', function() {
            try {
                styleService.register('style-id', {});
                fail();
            } catch (e) {
                expect(e).toBeDefined();
            }
        });

        describe('and updating the context for an id', function() {
            var deferred;
            var isDone = false;

            beforeEach(function() {
                deferred = $q.defer();
                restService.and.returnValue(deferred.promise);
                styleService.update('style-id', {
                    href: 'new-href',
                    media: 'new-media'
                }).then(function() {
                    isDone = true;
                });
            });

            it('should update the stored context', function() {
                expect(styleService.styles['style-id']).toEqual(jasmine.objectContaining({
                    id: 'style-id',
                    href: 'new-href',
                    media: 'new-media'
                }));
            });

            it('should pre-fetch the styles through a rest call', function() {
                expect(restService).toHaveBeenCalledWith({
                    params: {
                        method:'GET',
                        url: 'new-href'
                    }
                })
            });

            describe('and when the prefetching of the stylesheet succeeds', function() {
                beforeEach(function() {
                    deferred.resolve();
                    $rootScope.$digest();
                });

                it('should notify subscribers of this style', function() {
                    expect(events[0]).toEqual(jasmine.objectContaining({
                        id: 'style-id',
                        href: 'new-href',
                        media: 'new-media'
                    }));
                });

                it('should resolve the returned promise as well', function() {
                    expect(isDone).toBe(true);
                })
            });

            describe('and reseting to the initial context again', function() {
                beforeEach(function() {
                    events.length = 0;
                    styleService.reset('style-id');
                });

                it('should notify subscribers of the initial context', function() {
                    expect(events[0]).toEqual(jasmine.objectContaining({
                        id: 'style-id',
                        href: 'href',
                        media: 'media'
                    }))
                })
            })
        });        
    });
});