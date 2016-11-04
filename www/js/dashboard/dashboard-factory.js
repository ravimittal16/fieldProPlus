(function () {
    "use strict";
    function initFactory(apiBaseFactory) {
        var api = "api/workorders/";
        function testCall() {
            return apiBaseFactory.get(api + "GetValues");
        }
        var factory = {
            testCall: testCall
        };

        return factory;
    }
    initFactory.$inject = ["api-base-factory"]
    angular.module("fpm").factory("dashboard-factory", initFactory);
})();