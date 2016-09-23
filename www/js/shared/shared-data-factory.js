(function () {
    "use strict";
    function initFactory(apiBaseFactory, localStorageService, fieldPromaxConfig) {
        var apibaseurl = "api/Shared/";
        function getIniitialData() {
            var keyName = fieldPromaxConfig.localStorageKeys.initialData;
            var froce = byForce || false;
            if (froce === true) {
                localStorageService.remove(keyName);
            }
            var initialData = localStorageService.get(keyName);
            if (initialData) {
                return $q.when(initialData);
            } else {
                return apicontext.get(apibaseurl + "GetIniitialData").then(function (data) {
                    localStorageService.set(keyName, data);
                    return data;
                });
            }
        }
        return {
            getIniitialData: getIniitialData
        };
    }
    initFactory.$inject = ["api-base-factory", "localStorageService", "fieldPromaxConfig"];
    angular.module("fpm").factory("shared-data-factory", initFactory);
})();