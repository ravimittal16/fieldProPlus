(function () {
    "use strict";
    function initController($ionicScrollDelegate) {
        var vm = this;
        vm.user = { userName: "", password: "" };
        vm.events = {
            loginClick: function () {
                console.log(vm.user);
            }
        };
    }
    initController.$inject = ["$ionicScrollDelegate"];
    angular.module("fpm").controller("login-controller", initController);
})();