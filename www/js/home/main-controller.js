(function () {
    "use strict";
    function initController($scope) {
        var vm = this;
        vm.heading = "HELLLO WORLD FROM IONIC";

    }
    initController.$inject = ["$scope"];
    angular.module("fpm").controller("main-controller", initController);
})();