(function () {
    "use strict";
    function initController($scope, $state, localStorageService, fieldPromaxConfig,
        sharedDataFactory, fpmUtilitiesFactory) {
        var vm = this;
        vm.userSettings = { defaultCalenderViewForMobile: "workWeek", pushNotifications: false, locationServices: false };
        vm.events = {
            updateSettings: function () {
                fpmUtilitiesFactory.showLoading().then(function () {
                    sharedDataFactory.updateSettings(vm.userSettings).then(function (response) {
                        fpmUtilitiesFactory.alerts.alert("Saved", "Settings updated successfully", function () {
                            localStorageService.set(fieldPromaxConfig.localStorageKeys.settingsKeyName, JSON.parse(response));
                        });
                    }).finally(fpmUtilitiesFactory.hideLoading);
                });
            }
        };
        function activateController() {
            var settings = localStorageService.get(fieldPromaxConfig.localStorageKeys.settingsKeyName);
            if (settings) {
                vm.userSettings.defaultCalenderViewForMobile = settings.DefaultCalenderViewForMobile || "workWeek";
                vm.userSettings.startupPageForMobile = settings.StartupPageForMobile || states.todaysWorkOrders;
                vm.userSettings.pushNotifications = settings.PushNotifications || false;
                vm.userSettings.locationServices = settings.LocationServices || false;
            }
        }

        activateController();
    }
    initController.$inject = ["$scope", "$state", "localStorageService", "fieldPromaxConfig",
        "shared-data-factory", "fpm-utilities-factory"];
    angular.module("fpm").controller("settings-controller", initController);
})();