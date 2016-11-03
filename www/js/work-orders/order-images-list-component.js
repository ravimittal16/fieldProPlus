(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            barcode: "<"
        },
        templateUrl: "js/work-orders/order-images-list-component.template.html",
        controller: ["$scope", "$ionicModal", "work-orders-factory", "fpm-utilities-factory",
            function ($scope, $ionicModal, workOrdersFactory, fpmUtilitiesFactory) {
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

                $ionicModal.fromTemplateUrl("imageViewerModal.html", {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    console.log(modal);
                    vm.imageViewerModel = modal;
                });
            }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("orderImagesListComponent", componentConfig);
})()