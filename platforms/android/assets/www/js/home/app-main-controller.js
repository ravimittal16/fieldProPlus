(function () {
    "use strict";
    function initController($scope, $ionicSideMenuDelegate, $ionicNavBarDelegate, $state,
        fieldPromaxConfig, localStorageService, authenticationFactory) {
        var vm = this;
        var secLevels = fieldPromaxConfig.secLevels;
        var userData = authenticationFactory.getLoggedInUserInfo();
        var configurations = localStorageService.get("configurations");
        vm.sideMenuItems = [
            { title: "Home", state: "app.dashboard", icon: "home" },
            { title: "Calendar", state: "app.calendar", icon: "calendar" },
            { title: "Map", state: "app.map", icon: "location" },
            { title: "Create Work Order", state: "app.createWorkOrder", icon: "plus-round", isConfigurationBased: true, configProperty: "allowCreateWorkOrders" },
            { title: "Create Customer", state: "app.createCustomer", icon: "plus-round" },
            // { title: "Create Estimate", state: "app.createEstimate", icon: "plus-round", isConfigurationBased: true, configProperty: "allowCreateEstimates", hideFor: "ServiceProvider", basedOn: "" },
            { title: "My Expense", state: "app.expense", icon: "cash", basedOn: "etOn", specialFeature: true },
            { title: "Time Card", state: "app.timecard", icon: "clock", basedOn: "timeCard", specialFeature: true },
            { title: "Settings", state: "app.settings", icon: "settings" },
            { title: "Change Password", state: "app.changePassword", icon: "" },
            { title: "Logout", state: "app.logout", icon: "power" }

        ];
        $scope.$on("$ionicView.beforeEnter", function (e, data) {
            $ionicNavBarDelegate.showBackButton(false);
        });
        vm.events = {
            checkMenuItemVisibility: function (menu) {
                if (angular.isDefined(menu.basedOn)) {
                    var basedOn = userData[menu.basedOn];
                    return basedOn;
                }
                if (userData.isAdministrator) return true;
                if (angular.isDefined(menu.isConfigurationBased) && menu.isConfigurationBased === true && configurations && angular.isDefined(menu.configProperty)) {
                    var propValue = configurations[menu.configProperty];
                    return propValue;
                }
                return true;
            },
            onMenuItemClicked: function (item) {
                if (item.state === "app.logout") {
                    authenticationFactory.logout();
                    $state.go("login");
                } else {
                    $state.go(item.state);
                }
            },
            toggleLeft: function () {

            }
        };
    }
    initController.$inject = ["$scope", "$ionicSideMenuDelegate", "$ionicNavBarDelegate", "$state", "fieldPromaxConfig", "localStorageService", "authenticationFactory"];
    angular.module("fpm").controller("app-main-controller", initController);
})();