(function () {
    angular.module('rest.client', [])
        .value('restServiceHandler', jasmine.createSpy('restServiceHandler'))
})();
