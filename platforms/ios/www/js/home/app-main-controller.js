(function () {
    "use strict";
    function initController($ionicSideMenuDelegate, $state) {
        var vm = this;
        vm.sideMenuItems = [
            { title: "Home", state: "app.dashboard", icon: "home" },
            { title: "Calendar", state: "app.calendar", icon: "calendar" },
            { title: "Map", state: "app.map", icon: "locate" },
            { title: "Create Work Order", state: "app.createWorkOrder", icon: "add-circle" },
            { title: "Create Customer", state: "app.createCustomer", icon: "add-circle" },
            { title: "Create Estimate", state: "app.createEstimate", icon: "add-circle" },
            { title: "My Expanse", state: "app.expense", icon: "usd" },
            { title: "Time Card", state: "app.timecard", icon: "time" },
            { title: "Settings", state: "app.settings", icon: "checkbox" },
            { title: "Change Password", state: "app.changePassword", icon: "" },
            { title: "Logout", state: "app.logout", icon: "" }
        ];
        vm.even = {
            toggleLeft: function () {

            }
        };
    }
    initController.$inject = ["$ionicSideMenuDelegate", "$state"];
    angular.module("fpm").controller("app-main-controller", initController);
})();