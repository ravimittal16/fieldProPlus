(function () {
    "use strict";
    function initController($scope, $timeout, $state, authenticationFactory, fpmUtilities) {
        var vm = this;
        function activateController() {
            authenticationFactory.logout(true);
            $timeout(function () {
                $state.go("login");
            }, 200);
        }
        $scope.$on("$ionicView.beforeEnter", function (e, data) {
            activateController();
        });
    }
    initController.$inject = ["$scope", "$timeout", "$state", "authenticationFactory", "fpm-utilities-factory"];
    angular.module("fpm").controller("logout-controller", initController);
})();