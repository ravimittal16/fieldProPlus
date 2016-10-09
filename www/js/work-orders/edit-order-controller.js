(function () {
    "use strict";
    function initController($scope, $state, $stateParams, workOrderFactory) {
        var vm = this;

    }
    initController.$inject = ["$scope", "$state", "$stateParams", "work-orders-factory"];
    angular.module("fpm").controller("edit-order-controller", initController);
})();