(function () {
    "use strict";
    function initController($scope) {
        var vm = this;
        function onChangePasswordClicked() {
            console.log("HELLO WORLD");
        }
        vm.events = {
            onChangePasswordClicked: onChangePasswordClicked
        };
    }
    initController.$inject = ["$scope"];
    angular.module("fpm").controller("change-password-controller", initController);
})();