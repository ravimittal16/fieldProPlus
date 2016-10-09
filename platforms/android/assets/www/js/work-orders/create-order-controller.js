(function () {
    "use strict";
    function initController($scope, $state, workOrderFactory) {
        var vm = this;

    }
    initController.$inject = ["$scope", "$state", "work-orders-factory"];
    angular.module("fpm").controller("create-order-controller", initController);
})();