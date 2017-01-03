(function () {
    "use strict";
    function initFactory($q, apiBaseFactory, localStorageService, fieldPromaxConfig) {
        var apibaseurl = "api/Shared/";


        function updateSettings(settings) {
            return apiBaseFactory.post("api/User/UpdateUserSettings", settings);
        }

        function getIniitialData(byForce) {
            var keyName = fieldPromaxConfig.localStorageKeys.initialData;
            var froce = byForce || false;
            if (froce === true) {
                localStorageService.remove(keyName);
            }
            var initialData = localStorageService.get(keyName);
            if (initialData) {
                return $q.when(initialData);
            } else {
                return apiBaseFactory.get(apibaseurl + "GetIniitialData").then(function (data) {
                    localStorageService.set(keyName, data);
                    return data;
                });
            }
        }
        return {
            updateSettings: updateSettings,
            getIniitialData: getIniitialData
        };
    }
    initFactory.$inject = ["$q", "api-base-factory", "localStorageService", "fieldPromaxConfig"];
    angular.module("fpm").factory("shared-data-factory", initFactory);
})();