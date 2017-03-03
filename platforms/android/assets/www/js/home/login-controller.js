(function () {
    "use strict";
    function initController($scope, $stateParams, $timeout, $ionicPopup, $ionicLoading, authenticationFactory,
        $state, $ionicHistory, dashboardFactory, fpmUtilitiesFactory, sharedDataFactory, localStorageService) {
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
                vm.data.model = "";
                var myPopup = $ionicPopup.show({
                    templateUrl: "forgotPasswordModal.html",
                    title: 'Forgot Password',
                    subTitle: 'Please enter your registered email address',
                    scope: $scope,
                    buttons:
                    [
                        {
                            text: 'Cancel', onTap: function () {
                                vm.data.model = "";
                                return null;
                            }
                        },
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
                    if ($.trim(vm.data.model) !== "") {
                        vm.forgotPasswordModalErrors = []; vm.showError = false;
                        fpmUtilitiesFactory.showLoading("sending password...").then(function () {
                            authenticationFactory.sendPassword(res).then(function (res) {
                                if (angular.isArray(res) && res.length > 0) {
                                    vm.forgotPasswordModalErrors = res;
                                } else {
                                    alerts.alert("Password Sent", "Password has been sent successfully.");
                                }
                            }).finally(fpmUtilitiesFactory.hideLoading);
                        });
                    }
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
                                var previousState = localStorageService.get("appState");
                                if (previousState && angular.isDefined(previousState)) {
                                    if (previousState.params && angular.isDefined(previousState.params)) {
                                        $state.go(previousState.stateName, previousState.params);
                                    } else {
                                        $state.go(previousState.stateName);
                                    }
                                } else {
                                    $state.go("app.dashboard", { refresh: true });
                                }
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

        $scope.$on("$fpm:onLoginViewLoaded", function (event, args) {
            console.log("EVENT FIRED");
            $timeout(function () {
                if (args.clearPassword) {
                    vm.user.password = "";

                }
            }, 200);
        });
    }
    initController.$inject = ["$scope", "$stateParams", "$timeout", "$ionicPopup", "$ionicLoading", "authenticationFactory", "$state",
        "$ionicHistory", "dashboard-factory", "fpm-utilities-factory", "shared-data-factory", "localStorageService"];
    angular.module("fpm").controller("login-controller", initController);
})();