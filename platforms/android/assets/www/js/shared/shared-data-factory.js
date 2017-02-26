(function () {
    "use strict";
    function initFactory($q, apiBaseFactory, localStorageService, fieldPromaxConfig, fpmUtilitiesFactory) {
        var apibaseurl = "api/Shared/";
        var pushapi = "api/NotificationsHub/";
        var locationapi = "api/Location/";

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

        function saveLocationCordinates(p) {
            return apiBaseFactory.get(apibaseurl + "SaveLocationCoordinates?lat=" + p.latitude + "&lng=" + p.longitude);
        }
        function registerUserTemplateForPushNotifications() {
            var handle = localStorageService.get("PUSH:registrationId");
            var isOnDevMode = fpmUtilitiesFactory.isOnDevMode;
            if (!isOnDevMode && angular.isDefined(handle)) {
                var isAndroid = fpmUtilitiesFactory.device.isAndroid();
                var android = isAndroid ? "0" : "1";
                var pUrl = pushapi + "RegisterUserToHub?handle=" + handle + "&platform=" + android;
                return apiBaseFactory.get(pUrl);
            } else {
                var pUrl = pushapi + "RegisterUserToHub?handle=" + handle + "&platform=0";
                return apiBaseFactory.get(pUrl);
            }
        }
        //this will save gps location data to azure table storage
        function postLocation(location) {
            return apiBaseFactory.post(locationapi + "PostLocation", location);
        }
        return {
            postLocation: postLocation,
            registerUserTemplateForPushNotifications: registerUserTemplateForPushNotifications,
            updateSettings: updateSettings,
            getIniitialData: getIniitialData,
            saveLocationCordinates: saveLocationCordinates
        };
    }
    initFactory.$inject = ["$q", "api-base-factory", "localStorageService", "fieldPromaxConfig", "fpm-utilities-factory"];
    angular.module("fpm").factory("shared-data-factory", initFactory);
})();