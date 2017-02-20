(function () {
    "use strict";
    function initFactory($q, apiBaseFactory, localStorageService, fieldPromaxConfig, fpmUtilitiesFactory) {
        var apibaseurl = "api/Shared/";
        var pushapi = "api/NotificationsHub/"

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
            if (!isOnDevMode) {
                var isAndroid = fpmUtilitiesFactory.device.isAndroid();
                var android = isAndroid ? "0" : "1";
                var pUrl = pushapi + "RegisterUserToHub?handle=" + handle + "&platform=" + android;
                return apiBaseFactory.get(pUrl).then(function () {
                    fpmUtilitiesFactory.alerts.alert("SUCCESS", "SAVED REGISTRATION FOR PUSH");
                }, function () {
                    fpmUtilitiesFactory.alerts.alert("ERROR", "WHILE ADDING PUSH");
                });
            } else {
                console.log("TRY TO SAVE PUSH");
                var pUrl = pushapi + "RegisterUserToHub?handle=" + handle + "&platform=0";
                return apiBaseFactory.get(pUrl).then(function () {
                    fpmUtilitiesFactory.alerts.alert("SUCCESS", "SAVED REGISTRATION FOR PUSH");
                }, function () {
                    fpmUtilitiesFactory.alerts.alert("ERROR", "WHILE ADDING PUSH");
                });
            }
        }
        return {
            registerUserTemplateForPushNotifications: registerUserTemplateForPushNotifications,
            updateSettings: updateSettings,
            getIniitialData: getIniitialData,
            saveLocationCordinates: saveLocationCordinates
        };
    }
    initFactory.$inject = ["$q", "api-base-factory", "localStorageService", "fieldPromaxConfig", "fpm-utilities-factory"];
    angular.module("fpm").factory("shared-data-factory", initFactory);
})();