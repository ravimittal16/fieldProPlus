(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            barcode: "<",
            isEstimate: "<"
        },
        templateUrl: "js/work-orders/order-signature-card-component.template.html",
        controller: ["$scope", "$stateParams", "$ionicActionSheet", "authenticationFactory", "fieldPromaxConfig",
            function ($scope, $stateParams, $ionicActionSheet, authenticationFactory, fieldPromaxConfig) {
                var vm = this;
                var estimateId = 0;
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
                                    vm.imageUrl = baseUrl + "Handlers/GetBarcodeSignature.ashx?barcode=" + vm.barcode + "&dateStamp=" + new Date() + "&customernumber=" + user.customerNumber + "&estimate=" + vm.isEstimate + "&estimateId=" + estimateId;
                                }
                            });
                        }
                    },
                    onSignatureActionButtonClicked: function () {
                        vm.showingSignaturePad = true;
                        vm.imageUrl = baseUrl + "Handlers/GetBarcodeSignature.ashx?barcode=" + vm.barcode + "&dateStamp=" + new Date() + "&customernumber=" + user.customerNumber + "&estimate=" + vm.isEstimate + "&estimateId=" + estimateId;
                    }
                }
                $scope.$on("$signature:completedEvent", function () {
                    vm.showingSignaturePad = false;
                });
                vm.imageUrl = baseUrl + "Handlers/GetBarcodeSignature.ashx?barcode";
                vm.$onInit = function () {
                    if (vm.isEstimate) {
                        estimateId = $stateParams.id;
                    }
                    vm.imageUrl = baseUrl + "Handlers/GetBarcodeSignature.ashx?barcode=" + vm.barcode + "&dateStamp=" + new Date() + "&customernumber=" + user.customerNumber + "&estimate=" + vm.isEstimate + "&estimateId=" + estimateId;
                }
            }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("orderSignatureComponent", componentConfig);
})();