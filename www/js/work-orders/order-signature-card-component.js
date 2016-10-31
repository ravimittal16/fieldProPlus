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
                console.log("USS", user);
                vm.events = {
                    onSignaturePadActionButtonClicked: function () {
                        var signatureAction = $ionicActionSheet.show({
                            buttons: [
                                { text: 'Hide Signature Pad' }, { text: "Save New Signature" }
                            ],
                            titleText: 'Work Order Signature',
                            cancelText: 'Cancel',
                            cancel: function () {
                                // add cancel code..
                            },
                            buttonClicked: function (index) {
                                if (index === 0) {
                                    vm.showingSignaturePad = false;
                                }
                                return true;
                            }
                        });
                    },
                    onSignatureActionButtonClicked: function () {
                        var signatureAction = $ionicActionSheet.show({
                            buttons: [
                                { text: 'Show Signature Pad' }
                            ],
                            titleText: 'Work Order Signature',
                            cancelText: 'Cancel',
                            cancel: function () {
                                // add cancel code..
                            },
                            buttonClicked: function (index) {
                                if (index === 0) {
                                    vm.showingSignaturePad = true;
                                }
                                return true;
                            }
                        });
                    }
                }

                vm.imageUrl = baseUrl + "Handlers/GetBarcodeSignature.ashx?barcode";
                vm.dateStamp = new Date();
                vm.$onInit = function () {
                    vm.imageUrl = baseUrl + "Handlers/GetBarcodeSignature.ashx?barcode=" + vm.barcode + "&dateStamp=" + vm.dateStamp + "&customernumber=" + user.customerNumber;
                }
                vm.$onChanges = function () {

                }
            }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("orderSignatureComponent", componentConfig);
})();