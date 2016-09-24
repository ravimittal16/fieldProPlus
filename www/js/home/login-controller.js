(function () {
    "use strict";
    function initController($ionicScrollDelegate, $ionicPopup, $ionicLoading, authenticationFactory, $state, dashboardFactory) {
        var vm = this;
        vm.user = { userName: "", password: "" };
        vm.events = {
            loginClick: function (isValid) {
                if (!isValid) {
                    $ionicPopup.alert({ title: "Oops", template: "Please enter login information..." });
                    return false;
                }
                $ionicLoading.show({ template: "authenticating you..." }).then(function () {
                    authenticationFactory.login(vm.user).then(function (response) {
                          $ionicPopup.alert({ title: "Oops", template: "Please enter login information..." });
                        $ionicLoading.hide().then(function () {
                            if (response && authenticationFactory.authentication.isAuth) {
                                $state.go("app.dashboard");
                            }
                            console.log(response);
                        }, function (data) {
                            $ionicLoading.hide();
                            $ionicPopup.alert({ title: "Oops", template: "ERROR WHILE TRYING TO LOGIN" });
                        });
                    });
                });
            }
        };

        dashboardFactory.testCall().then(function (response) {
            console.log("HEHEHE", response);
        });
    }
    initController.$inject = ["$ionicScrollDelegate", "$ionicPopup", "$ionicLoading", "authenticationFactory", "$state", "dashboard-factory"];
    angular.module("fpm").controller("login-controller", initController);
})();