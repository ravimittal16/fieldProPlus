(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            barcode: "<"
        },
        templateUrl: "js/work-orders/order-images-list-component.template.html",
        controller: ["$scope", "work-orders-factory", function ($scope, workOrdersFactory) {
            var vm = this;
            vm.isExpanded = false;
            vm.events = {
                onDeleteImageClicked: function (img) {
                    console.log(img);
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