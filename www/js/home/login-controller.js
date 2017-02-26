(function () {
    "use strict";
    function initController($scope, $timeout, $ionicPopup, $ionicLoading, authenticationFactory,
        $state, $ionicHistory, dashboardFactory, fpmUtilitiesFactory, sharedDataFactory) {
        var vm = this;
        vm.user = { userName: "", password: "" };
        vm.showError = false;
        vm.data = {
            model: ""
        };
        var alerts = fpmUtilitiesFactory.alerts;

        vm.events = {
            onForgotPasswordClicked: function () {
                vm.forgotPasswordModalErrors = [];
                var myPopup = $ionicPopup.show({
                    templateUrl: "forgotPasswordModal.html",
                    title: 'Forgot Password',
                    subTitle: 'Please enter your registered email address',
                    scope: $scope,
                    buttons:
                    [
                        { text: 'Cancel' },
                        {
                            text: 'Send password',
                            type: 'button-positive',
                            onTap: function (e) {
                                if (!vm.data.model) {
                                    vm.forgotPasswordModalErrors.push("please check the entered email");
                                    e.preventDefault();
                                } else {
                                    return vm.data.model;
                                }
                            }
                        }]
                });
                myPopup.then(function (res) {
                    vm.forgotPasswordModalErrors = []; vm.showError = false;
                    authenticationFactory.sendPassword(res).then(function (res) {
                        if (angular.isArray(res) && res.length > 0) {
                            vm.forgotPasswordModalErrors = res;
                        } else {
                            alerts.alert("Password Sent", "Password has been sent successfully.");
                        }
                    })
                });
            },
            loginClick: function (isValid) {
                vm.showError = false;
                vm.errors = [];
                if (!isValid) {
                    alerts.alert("Oops", "Please enter login information...");
                    return false;
                }
                $ionicLoading.show({ template: "authenticating you..." }).then(function () {
                    authenticationFactory.login(vm.user).then(function (response) {
                        $ionicLoading.hide().then(function () {
                            if (response && authenticationFactory.authentication.isAuth) {
                                if (!fpmUtilitiesFactory.isOnDevMode) {
                                    fpmUtilitiesFactory.locationService.start(sharedDataFactory.saveLocationCordinates);
                                    sharedDataFactory.registerUserTemplateForPushNotifications();
                                }
                                $state.go("app.dashboard", { refresh: true });
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

        function tryUserLoginFromStorage() {
            var credentials = authenticationFactory.getStoredCredentials();
            if (credentials && angular.isDefined(credentials)) {
                vm.user = angular.copy(credentials);
                vm.events.loginClick(true);
            }
        }

        $scope.$on('$ionicView.loaded', function () {
            $timeout(function () {
                $ionicHistory.clearHistory();
                $ionicHistory.clearCache();
                tryUserLoginFromStorage();
            }, 200);
        });
    }
    initController.$inject = ["$scope", "$timeout", "$ionicPopup", "$ionicLoading", "authenticationFactory", "$state",
        "$ionicHistory", "dashboard-factory", "fpm-utilities-factory", "shared-data-factory"];
    angular.module("fpm").controller("login-controller", initController);
})();