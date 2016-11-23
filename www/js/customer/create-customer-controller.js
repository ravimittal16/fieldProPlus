(function () {
    "use strict";
    function initController($scope, $state, $ionicActionSheet, localStorageService, fpmUtilitiesFactory) {
        var vm = this;
        var customerModel = {
            displayName: "", firstName: "", lastName: "", companyName: "", email: "", phone: "",
            mobile: "", fax: "", bStreet: "", bCity: "", bState: "", bZip: "", sStreet: "", sCity: "", sState: "",
            sZip: "", uinNum: ""
        };
        function moveToDashboard() {

        }
        function onBackToDashboardClicked(isDirty) {
            if (isDirty) {
                fpmUtilitiesFactory.alerts.confirm("Confirmation", "Are you sure?", function () {
                    moveToDashboard();
                });
            } else {
                moveToDashboard();
            }
        }
        function onSubmitButtonClicked(isValid) {
            console.log(vm.customerModel);
        }
        function onServiceAddressActionClicked() {
            $ionicActionSheet.show({
                buttons: [{
                    text: 'Same as Business Address'
                }, {
                    text: "Clear Address"
                }],
                titleText: 'Service Address Options',
                cancelText: 'Cancel',
                cancel: function () {
                    // add cancel code..
                },
                buttonClicked: function (index) {
                    if (index === 0) {
                        vm.customerModel.sStreet = vm.customerModel.bStreet;
                        vm.customerModel.sState = vm.customerModel.bState;
                        vm.customerModel.sCity = vm.customerModel.bCity;
                        vm.customerModel.sZip = vm.customerModel.bZip;
                    }
                    if (index === 1) {
                        vm.customerModel.sStreet = "";
                        vm.customerModel.sState = "";
                        vm.customerModel.sCity = "";
                        vm.customerModel.sZip = "";
                    }
                    return true;
                }
            });
        }
        vm.events = {
            onBackToDashboardClicked: onBackToDashboardClicked,
            onSubmitButtonClicked: onSubmitButtonClicked,
            onServiceAddressActionClicked: onServiceAddressActionClicked
        }
        function activateController() {
            vm.customerModel = angular.copy(customerModel);
        }
        $scope.$on("$ionicView.afterEnter", function (e, data) {
            activateController();
        });

    }
    initController.$inject = ["$scope", "$state", "$ionicActionSheet", "localStorageService", "fpm-utilities-factory"];
    angular.module("fpm").controller("create-customer-controller", initController);
})();