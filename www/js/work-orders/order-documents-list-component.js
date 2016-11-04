(function () {
  "use strict";
  var componentConfig = {
    templateUrl: "js/work-orders/order-documents-list-component.template.html",
    bindings: {
      barcode: "<"
    },
    controller: ["$scope", "work-orders-factory", "fpm-utilities-factory", "fieldPromaxConfig",
      function ($scope, workOrdersFactory, fpmUtilitiesFactory, fieldPromaxConfig) {
        var vm = this;
        var baseUrl = fieldPromaxConfig.fieldPromaxApi;
        var alerts = fpmUtilitiesFactory.alerts;
        vm.docUrl = "";
        vm.events = {
          onDocumentClicked: function (doc) {
            window.open(baseUrl + "Handlers/GetImageFromBlob.ashx?imageId=" + doc.num + "&dateStamp=" + new Date() + "&flag=viewTarget", "_system", "location=yes");
          },
          onDeleteDocumentClicked: function (doc) {
            alerts.confirmDelete(function () {

            });
          }
        };
        vm.$onInit = function () {
          if (vm.barcode) {
            workOrdersFactory.getUploadedDocuments(vm.barcode).then(function (response) {
              vm.barcodeDocuments = response;
              console.log(vm.barcodeDocuments);
            });
          }
        }
      }
    ],
    controllerAs: "vm"
  };
  angular.module("fpm").component("orderDocumentsListComponent", componentConfig);
})();
