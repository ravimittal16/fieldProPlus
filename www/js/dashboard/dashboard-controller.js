(function () {
    "use strict";
    function initController($scope, dashboardFactory) {
        var vm = this;
        vm.heading = "HELLLO WORLD FROM IONIC";
        dashboardFactory.testCall().then(function (response) {
            vm.result = response;
        });
    }
    initController.$inject = ["$scope", "dashboard-factory"];
    angular.module("fpm").controller("dashboard-controller", initController);
})();