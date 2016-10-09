(function () {
    "use strict";
    function initController($scope, $state, authenticationFactory) {
        var vm = this;
        function activateController() {
            authenticationFactory.logout();
            $state.go("login");
        }
        activateController();
        console.log("HELLO WORLD")
    }
    initController.$inject = ["$scope", "$state", "authenticationFactory"];
    angular.module("fpm").controller("logout-controller", initController);
})();