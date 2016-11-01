(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            barcode: "<"
        },
        templateUrl: "js/work-orders/order-images-list-component.template.html",
        controller: ["$scope", "work-orders-factory", "fpm-utilities-factory",
            function ($scope, workOrdersFactory, fpmUtilitiesFactory) {
                var vm = this;
                vm.isExpanded = false;
                var alerts = fpmUtilitiesFactory.alerts;
                vm.events = {
                    onDeleteImageClicked: function (img) {
                        alerts.confirmDelete(function () {
                            console.log("HELLO WORLDF");
                        });
                    },
                    onImageTap: function (p) {

                     }
                };
                vm.$onInit = function () {
                    if (vm.barcode) {
                        workOrdersFactory.getImagesList(vm.barcode).then(function (response) {
                            vm.barcodeImages = response;
                        });
                    }
                }
            }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("orderImagesListComponent", componentConfig);
})()