(function () {
    "use strict";
    function initController($scope) {
        var vm = this;
        vm.user = { userName: "", password: "" };
        vm.events = {
            loginClick: function () {
                console.log(vm.user);
            }
        };
    }
    initController.$inject = ["$scope"];
    angular.module("fpm").controller("login-controller", initController);
})();