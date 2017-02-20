(function () {
    "use strict";
    function initController($scope, $state, $ionicActionSheet, customersFileFactory, localStorageService, fpmUtilitiesFactory) {
        var vm = this;
        var customerModel = {
            displayName: "", firstName: "", lastName: "", companyName: "", email: "", phone: "",
            mobile: "", fax: "", bStreet: "", bCity: "", bState: "", bZip: "", sStreet: "", sCity: "", sState: "",
            sZip: "", uinNum: ""
        };
        vm.errors = [];
        function moveToDashboard() {
            $state.go("app.dashboard", { refresh: false });
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
            vm.errors = [];
            if (isValid) {
                fpmUtilitiesFactory.showLoading().then(function () {
                    customersFileFactory.createCustomer(vm.customerModel).then(function (response) {
                        if (angular.isArray(response.errors) && response.errors.length > 0) {
                            vm.errors = response.errors;
                        } else {
                            fpmUtilitiesFactory.alerts.alert("Success", "Customer create successfully", function () {
                                moveToDashboard();
                            });
                        }
                    }).finally(fpmUtilitiesFactory.hideLoading);
                });
            } else {
                vm.errors.push("Please check all values before save");
            }
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
    initController.$inject = ["$scope", "$state", "$ionicActionSheet", "customers-file-factory", "localStorageService", "fpm-utilities-factory"];
    angular.module("fpm").controller("create-customer-controller", initController);
})();