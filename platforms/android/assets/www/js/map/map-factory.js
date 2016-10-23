(function () {
    function initFactory(apiBaseFactory) {
        var apibaseurl = "api/Dashboard/";
        function getMapData() {
            return apiBaseFactory.get(apibaseurl + "GetMapData");
        }
        return {
            getMapData: getMapData
        };
    }
    initFactory.$inject = ["api-base-factory"]
    angular.module("fpm").factory("map-factory", initFactory);
})();