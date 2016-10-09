(function () {
    "use strict";
    function initController($scope, $state, localStorageService, fieldPromaxConfig) {
        var vm = this;
        vm.userSettings = { defaultCalenderViewForMobile: "workWeek", pushNotifications: false, locationServices: false };

        function activateController() {
            var settings = localStorageService.get(fieldPromaxConfig.localStorageKeys.settingsKeyName);
            console.log(settings);
            if (settings) {
                vm.userSettings.defaultCalenderViewForMobile = settings.DefaultCalenderViewForMobile || "workWeek";
                vm.userSettings.startupPageForMobile = settings.StartupPageForMobile || states.todaysWorkOrders;
                vm.userSettings.pushNotifications = settings.PushNotifications || false;
                vm.userSettings.locationServices = settings.LocationServices || false;
            }
        }

        activateController();
    }
    initController.$inject = ["$scope", "$state", "localStorageService", "fieldPromaxConfig"];
    angular.module("fpm").controller("settings-controller", initController);
})();