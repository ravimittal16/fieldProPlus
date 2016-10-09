(function () {
    "use strict";
    function initFactory($q, $cacheFactory, apiBaseFactory, sharedDataFactory) {
        var apibaseurl = "api/workorders/"
        var cache = $cacheFactory("orderCache");
        var dashboardDataKeyName = "dashboardData";

        function getMobileDashboard(forceGet, initialData) {
            forceGet = forceGet === null ? false : forceGet;
            if (forceGet === true) {
                cache.remove(dashboardDataKeyName);
            }
            var orders = cache.get(dashboardDataKeyName);
            if (angular.isDefined(orders) && orders) {
                return $q.when(orders);
            } else {
                return apiBaseFactory.get(apibaseurl + "GetMobileDashboard").then(function (response) {
                    cache.put(dashboardDataKeyName, response);
                    return response;
                });
            }
        }
        return {
            getMobileDashboard: getMobileDashboard
        };
    }
    initFactory.$inject = ["$q", "$cacheFactory", "api-base-factory", "shared-data-factory"];
    angular.module("fpm").factory("work-orders-factory", initFactory);
})();