(function () {
    "use strict";
    function initController($scope, $ionicSideMenuDelegate, $ionicNavBarDelegate, $state) {
        var vm = this;
        vm.sideMenuItems = [
            { title: "Home", state: "app.dashboard", icon: "home" },
            { title: "Calendar", state: "app.calendar", icon: "calendar" },
            { title: "Map", state: "app.map", icon: "location" },
            { title: "Create Work Order", state: "app.createWorkOrder", icon: "plus-round" },
            { title: "Create Customer", state: "app.createCustomer", icon: "plus-round" },
            { title: "Create Estimate", state: "app.createEstimate", icon: "plus-round" },
            { title: "My Expanse", state: "app.expense", icon: "cash" },
            { title: "Time Card", state: "app.timecard", icon: "clock" },
            { title: "Settings", state: "app.settings", icon: "settings" },
            { title: "Change Password", state: "app.changePassword", icon: "" },
            { title: "Logout", state: "app.logout", icon: "power" }
        ];

        $scope.$on("$ionicView.beforeEnter", function (e, data) {
            $ionicNavBarDelegate.showBackButton(false);
        });
        vm.events = {
            onMenuItemClicked: function (item) {
                $state.go(item.state);
            },
            toggleLeft: function () {

            }
        };
    }
    initController.$inject = ["$scope", "$ionicSideMenuDelegate", "$ionicNavBarDelegate", "$state"];
    angular.module("fpm").controller("app-main-controller", initController);
})();