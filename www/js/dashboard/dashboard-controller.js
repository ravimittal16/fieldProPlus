(function () {
    "use strict";
    function initController($scope, workOrderFactory) {
        var vm = this;
        vm.heading = "HELLLO WORLD FROM IONIC";
        workOrderFactory.getMobileDashboard().then(function (response) {
            vm.result = response;
        }, function (data) {
            console.log("ERRPR", data)
        });
    }
    initController.$inject = ["$scope", "work-orders-factory"];
    angular.module("fpm").controller("dashboard-controller", initController);
})();