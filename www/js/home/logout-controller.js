(function () {
    "use strict";
    function initController($scope, $rootScope, $timeout, $state, authenticationFactory, fpmUtilities) {
        var vm = this;
        function activateController() {
            authenticationFactory.logout(true);
            $timeout(function () {
                $rootScope.$broadcast("$fpm:onLoginViewLoaded", { fromLogout: true });
                $state.go("login");
            }, 200);
        }
        $scope.$on("$ionicView.beforeEnter", function (e, data) {
            activateController();
        });
    }
    initController.$inject = ["$scope", "$rootScope", "$timeout", "$state", "authenticationFactory", "fpm-utilities-factory"];
    angular.module("fpm").controller("logout-controller", initController);
})();