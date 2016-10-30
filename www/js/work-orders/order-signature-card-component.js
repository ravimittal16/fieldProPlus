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
                var baseUrl = fieldPromaxConfig.fieldPromaxApi;
                var user = authenticationFactory.getLoggedInUserInfo();
                console.log("USS", user);
                vm.events = {
                    onSignatureActionButtonClicked: function () {
                        var signatureAction = $ionicActionSheet.show({
                            buttons: [
                                { text: 'Add Signature' }
                            ],
                            titleText: 'Work Order Signature',
                            cancelText: 'Cancel',
                            cancel: function () {
                                // add cancel code..
                            },
                            buttonClicked: function (index) {

                                return true;
                            }
                        });
                    }
                }

                vm.imageUrl = baseUrl + "Handlers/GetBarcodeSignature.ashx?barcode" ;
                vm.dateStamp = new Date();
                vm.$onInit = function () {
                    vm.imageUrl = baseUrl + "Handlers/GetBarcodeSignature.ashx?barcode=" + vm.barcode + "&dateStamp=" + vm.dateStamp + "&customernumber=" + user.customerNumber;
                    console.log("SD",vm.imageUrl);
                }
                vm.$onChanges = function () {
                    console.log("FROM SIGNATURE SDE");
                    console.log("FROM SIGNATURE", vm.barcode);
                    
                }
            }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("orderSignatureComponent", componentConfig);
})();