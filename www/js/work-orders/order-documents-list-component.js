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
        vm.gettinDocuments = false;
        vm.events = {
          onDocumentClicked: function (doc) {
            window.open(baseUrl + "Handlers/GetImageFromBlob.ashx?imageId=" + doc.num + "&dateStamp=" + new Date() + "&flag=viewTarget&cust=" + doc.customerNumber, "_system", "location=yes");
          }
        };
        vm.$onInit = function () {
          if (vm.barcode) {
            vm.gettinDocuments = true;
            workOrdersFactory.getUploadedDocuments(vm.barcode).then(function (response) {
              if (angular.isArray(response) && response.length > 0) {
                var pdfs = _.where(response, { extension: ".pdf" });
                vm.barcodeDocuments = pdfs;
              }
              vm.gettinDocuments = false;
            });
          } else {
            vm.gettinDocuments = false;
          }
        }
      }
    ],
    controllerAs: "vm"
  };
  angular.module("fpm").component("orderDocumentsListComponent", componentConfig);
})();
