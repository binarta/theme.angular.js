(function(angular) {
    'use strict';
    angular.module('bin.theme')
        .service('styleService', ['restServiceHandler', StyleService]);

    function StyleService(restService) {
        this.defaults = {};
        this.styles = {};
        this.events = new BinartaRX();
        this.restService = restService
    }
    StyleService.prototype.register = function(id, context) {
        if (this.styles[id] !== undefined)
            throw new Error('Style context for [' + id + '] was already registered!');
        context.id = id;
        this.styles[id] = new StyleContext(context);
        this.defaults[id] = new StyleContext(context);
    };
    
    StyleService.prototype.update = function(id, newContext) {
        var self = this;
        var context = this.styles[id];
        context.update(newContext);
        return this.restService({
            params: {
                method:'GET',
                url:context.href
            }
        }).then(function() {
            self.events.notify('onStyleChange', context);
        });
    };
    
    StyleService.prototype.reset = function(id) {
        var initial = this.defaults[id];
        this.events.notify('onStyleChange', initial);
    };

    function StyleContext(args) {
        this.id = args.id;
        this.href = args.href;
        this.media = args.media;
    }

    StyleContext.prototype.update = function(context) {
        this.href = context.href;
        this.media = context.media;
    }
})(angular);