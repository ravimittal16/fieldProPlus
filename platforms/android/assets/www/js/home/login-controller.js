(function () {
    "use strict";
    function initController($ionicScrollDelegate, $ionicPopup, $ionicLoading, authenticationFactory, $state, dashboardFactory) {
        var vm = this;
        vm.user = { userName: "", password: "" };
        vm.showError = false;
        vm.events = {
            loginClick: function (isValid) {
                vm.showError = false;
                vm.errors = [];
                if (!isValid) {
                    $ionicPopup.alert({ title: "Oops", template: "Please enter login information..." });
                    return false;
                }
                $ionicLoading.show({ template: "authenticating you..." }).then(function () {
                    authenticationFactory.login(vm.user).then(function (response) {
                        $ionicLoading.hide().then(function () {
                            if (response && authenticationFactory.authentication.isAuth) {
                                $state.go("app.dashboard");
                            }
                        });
                    }, function (data) {
                        $ionicLoading.hide();
                        vm.showError = true;
                        if (data.error) {
                            vm.errors = [data.error];
                        } else {
                            vm.errors = ["Invalid Email or Password"];
                        }
                    });
                });
            }
        };
    }
    initController.$inject = ["$ionicScrollDelegate", "$ionicPopup", "$ionicLoading", "authenticationFactory", "$state", "dashboard-factory"];
    angular.module("fpm").controller("login-controller", initController);
})();