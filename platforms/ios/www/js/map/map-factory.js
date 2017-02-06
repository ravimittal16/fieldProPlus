(function () {
    function initFactory(apiBaseFactory, $q, $cacheFactory) {
        var apibaseurl = "api/Dashboard/";
        var cache = $cacheFactory("mapCache");
        var mapCacheKeyName = "workorder:mapdata";
        function getMapData(forceGet) {
            forceGet = forceGet === null ? false : forceGet;
            if (forceGet === true) {
                cache.remove(mapCacheKeyName);
            }
            var orders = cache.get(mapCacheKeyName);
            if (angular.isDefined(orders) && orders) {
                return $q.when(orders);
            } else {
                return apiBaseFactory.get(apibaseurl + "GetMapData?fromMobile=true").then(function (response) {
                    cache.put(mapCacheKeyName, response);
                    return response;
                });
            }
        }
        return {
            getMapData: getMapData
        };
    }
    initFactory.$inject = ["api-base-factory", "$q", "$cacheFactory"]
    angular.module("fpm").factory("map-factory", initFactory);
})();