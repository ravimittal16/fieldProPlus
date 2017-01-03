(function () {
    "use strict";
    function initController($scope, $state, authenticationFactory, fpmUtilitiesFactory) {
        var vm = this;
        vm.errors = [];
        vm.model = { oldPassword: "", newPassword: "", confirmPassword: "" };
        function onChangePasswordClicked(isValid) {
            vm.errors = [];
            fpmUtilitiesFactory.showLoading().then(function () {
                authenticationFactory.changePassword(vm.model).then(function (response) {
                    if (response.ok === true) {
                        fpmUtilitiesFactory.alerts.alert("Success", response.msg, function () {
                            authenticationFactory.logout();
                            $state.go("login");

                        });
                    } else {
                        vm.errors.push(response.msg);
                    }
                }).finally(fpmUtilitiesFactory.hideLoading);
            });
        }
        vm.events = {
            onChangePasswordClicked: onChangePasswordClicked
        };
    }
    initController.$inject = ["$scope", "$state", "authenticationFactory", "fpm-utilities-factory"];
    angular.module("fpm").controller("change-password-controller", initController);
})();