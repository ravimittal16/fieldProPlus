(function () {
    "use strict";
    function initController($ionicScrollDelegate, $ionicPopup, $ionicLoading, authenticationFactory, $state) {
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
                        $ionicLoading.hide().then(function () {
                            if (response && authenticationFactory.authentication.isAuth) {
                                $state.go("app.dashboard");
                            }
                            console.log(response);
                        }, function () { 
                            $ionicLoading.hide();
                            $ionicPopup.alert({ title: "Oops", template: "ERROR WHILE TRYING TO LOGIN" });
                        });
                    });
                });
            }
        };
    }
    initController.$inject = ["$ionicScrollDelegate", "$ionicPopup", "$ionicLoading", "authenticationFactory", "$state"];
    angular.module("fpm").controller("login-controller", initController);
})();