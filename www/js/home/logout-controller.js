(function () {
    "use strict";
    function initController($scope, $timeout, $state, authenticationFactory) {
        var vm = this;
        function activateController() {
            console.log("HELLLOD");
            authenticationFactory.logout();
            $timeout(function () {
                $state.go("login");
            }, 200);
        }
        $scope.$on("$ionicView.beforeEnter", function (e, data) {
            activateController();
        });
    }
    initController.$inject = ["$scope", "$timeout", "$state", "authenticationFactory"];
    angular.module("fpm").controller("logout-controller", initController);
})();