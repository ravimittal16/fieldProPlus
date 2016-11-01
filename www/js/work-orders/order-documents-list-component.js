(function () {
    "use strict";
    var componentConfig = {
        templateUrl: "js/work-orders/order-documents-list-component.template.html",
        bindings: {
            barcode: "<"
        },
        controller: ["$scope", "work-orders-factory", "fpm-utilities-factory",
            function ($scope, workOrdersFactory, fpmUtilitiesFactory) {
                var vm = this;
                var alerts = fpmUtilitiesFactory.alerts;
                vm.events = {
                    onDocumentClicked: function (doc) {
                        alerts.confirmDelete(function () { 
                            
                        });
                    },
                    onDeleteDocumentClicked: function (doc) { }
                };
                vm.$onInit = function () {
                    if (vm.barcode) {
                        workOrdersFactory.getUploadedDocuments(vm.barcode).then(function (response) {
                            vm.barcodeDocuments = response;
                        });
                    }
                }
            }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("orderDocumentsListComponent", componentConfig);
})();