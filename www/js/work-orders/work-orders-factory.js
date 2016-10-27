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

        function getBarcodeDetails(barcode) {
            return apiBaseFactory.get(apibaseurl + "GetBarcodeDetails?barcode=" + barcode);
        }
        function deleteProduct(barcode, num) {
            return apiBaseFactory.get(apibaseurl + "DeleteProduct?barcode=" + barcode + "&productNum=" + num);
        }
        function updateProduct(model) {
            return apiBaseFactory.post(apibaseurl + "UpdateProduct?fromMobile=true", model);
        }

        return {
            getMobileDashboard: getMobileDashboard,
            getBarcodeDetails: getBarcodeDetails,
            deleteProduct: deleteProduct,
            updateProduct: updateProduct
        };
    }
    initFactory.$inject = ["$q", "$cacheFactory", "api-base-factory", "shared-data-factory"];
    angular.module("fpm").factory("work-orders-factory", initFactory);
})();