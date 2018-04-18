'use strict';

describe('binStyleDirective', function() {
    var element = undefined;
    var styleService = undefined;
    var $rootScope = undefined;

    beforeEach(module('bin.theme'));

    beforeEach(inject(function(_styleService_, restServiceHandler, $q, _$rootScope_) {
        styleService = _styleService_;
        restServiceHandler.and.returnValue($q.when());
        $rootScope = _$rootScope_;
    }));

    describe('on init', function() {
        beforeEach(inject(function($rootScope, $compile) {
            element = $compile('<style bin-style id="style-id" href="href" media="media"/>')($rootScope);
        }));

        it('should have registered the context in the style service', function() {
            var context = styleService.styles['style-id'];
            expect(context).toEqual(jasmine.objectContaining({
                id: 'style-id',
                href: 'href',
            }));
        });

        describe('and the styles get updated externally', function() {
            beforeEach(function() {
                styleService.update('style-id', {
                    href: 'new-href',
                });
                $rootScope.$digest();

            });

            it('should update the attributes on the element', function() {
                expect(element.attr('href')).toEqual('new-href');
            })
        });

        describe('and the styles of another context get updated externally', function() {
            beforeEach(function() {
                styleService.register('another-id', {});
                styleService.update('another-id', {
                    href: 'new-href',
                });
                $rootScope.$digest();
            });

            it('should leave the attrs of the element untouched', function() {
                expect(element.attr('href')).toEqual('href');
            })
        })
    });
})