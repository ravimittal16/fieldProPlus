(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            barcode: "<"
        },
        templateUrl: "js/work-orders/order-signature-card-component.template.html",
        controller: ["$scope", "$ionicActionSheet", "authenticationFactory", "fieldPromaxConfig",
            function ($scope, $ionicActionSheet, authenticationFactory, fieldPromaxConfig) {
                var vm = this;
                vm.showingSignaturePad = false
                var baseUrl = fieldPromaxConfig.fieldPromaxApi;
                var user = authenticationFactory.getLoggedInUserInfo();
                vm.signPadEvents = null;

                vm.events = {
                    closeSignaturePad: function () {
                        vm.showingSignaturePad = false;
                    },
                    saveSignature: function () {
                        if (vm.signPadEvents) {
                            vm.signPadEvents.trySaveSignature().then(function (response) {
                                if (response === true) {
                                    vm.showingSignaturePad = false;
                                    vm.imageUrl = baseUrl + "Handlers/GetBarcodeSignature.ashx?barcode=" + vm.barcode + "&dateStamp=" + new Date() + "&customernumber=" + user.customerNumber;
                                }
                            });
                        }
                    },
                    onSignatureActionButtonClicked: function () {
                        vm.showingSignaturePad = true;
                        vm.imageUrl = baseUrl + "Handlers/GetBarcodeSignature.ashx?barcode=" + vm.barcode + "&dateStamp=" + new Date() + "&customernumber=" + user.customerNumber;
                    }
                }
                $scope.$on("$signature:completedEvent", function () {
                    vm.showingSignaturePad = false;
                });
                vm.imageUrl = baseUrl + "Handlers/GetBarcodeSignature.ashx?barcode";
                vm.$onInit = function () {
                    vm.imageUrl = baseUrl + "Handlers/GetBarcodeSignature.ashx?barcode=" + vm.barcode + "&dateStamp=" + new Date() + "&customernumber=" + user.customerNumber;
                }
                vm.$onChanges = function () {

                }
            }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("orderSignatureComponent", componentConfig);
})();