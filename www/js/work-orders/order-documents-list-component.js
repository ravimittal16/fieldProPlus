(function () {
  "use strict";
  var componentConfig = {
    templateUrl: "js/work-orders/order-documents-list-component.template.html",
    bindings: {
      barcode: "<",
    },
    controller: [
      "$scope",
      "work-orders-factory",
      "fpm-utilities-factory",
      "fieldPromaxConfig",
      function (
        $scope,
        workOrdersFactory,
        fpmUtilitiesFactory,
        fieldPromaxConfig
      ) {
        var vm = this;
        var baseUrl = fieldPromaxConfig.fieldPromaxApi;
        var alerts = fpmUtilitiesFactory.alerts;
        vm.docUrl = "";
        vm.gettinDocuments = false;
        var supportedFiles = [
          ".pdf",
          ".xls",
          ".xlsx",
          ".txt",
          ".doc",
          ".docx",
          ".ppt",
          ".pptx",
          ".zip",
        ];
        var maxImageSize = 20 * 1024 * 1024;
        var selectedFiles = null;
        vm.upload = {
          control: null,
          options: {
            multiple: true,
            showFileList: false,
            localization: {
              select: "Upload documents",
            },
            select: function (e) {
              e.isDefaultPrevented = true;
              var largeFiles = _.filter(e.files, function (f) {
                return f.size > maxImageSize;
              });
              if (largeFiles.length > 0) {
                alerts.alert(
                  "Invalid Selection",
                  "Document size is too large to upload"
                );
                e.preventDefault();
                return false;
              }
              selectedFiles = e.files;
              var matchingFiles = _.filter(e.files, function (file) {
                return _.contains(supportedFiles, file.extension.toLowerCase());
              });
              if (matchingFiles.length !== e.files.length) {
                alerts.alert(
                  "Invalid Selection",
                  "Invalid File Type(s) Found. Make sure only document files are selected."
                );
                e.preventDefault();
                return false;
              }
              fpmUtilitiesFactory.showLoading("Uploading");
              var model = {
                barcode: vm.barcode,
                estimateId: 0,
                rotate: false,
                isFromDocumentUpload: true,
              };
              workOrdersFactory
                .uploadFiles(e.files, model)
                .then(function (response) {
                  if (
                    response &&
                    angular.isArray(response) &&
                    response.length > 0
                  ) {
                    __fetchDocuments();
                    alerts.alert(
                      "Uploaded",
                      "Document(s) uploaded successfully."
                    );
                  }
                })
                .finally(function () {
                  fpmUtilitiesFactory.hideLoading();
                });

              e.preventDefault();
            },
          },
        };

        vm.events = {
          onDeleteDocumentClicked: function ($e, doc, index) {
            $e.stopPropagation();
            alerts.confirmDelete(function () {
              fpmUtilitiesFactory.showLoading().then(function () {
                workOrdersFactory
                  .deleteDocument(doc.num)
                  .then(function (response) {
                    __fetchDocuments();
                    alerts.alert("Deleted", "Document deleted successfully.");
                  })
                  .finally(function () {
                    fpmUtilitiesFactory.hideLoading();
                  });
              });
            });
          },
          onDocumentClicked: function (doc) {
            cordova.InAppBrowser.open(
              baseUrl +
                "Handlers/GetImageFromBlob.ashx?imageId=" +
                doc.num +
                "&dateStamp=" +
                new Date() +
                "&flag=viewTarget&cust=" +
                doc.customerNumber,
              "_system",
              "location=yes"
            );
          },
        };
        function __fetchDocuments() {
          vm.gettinDocuments = true;
          vm.barcodeDocuments = [];
          workOrdersFactory
            .getUploadedDocuments(vm.barcode)
            .then(function (response) {
              if (angular.isArray(response) && response.length > 0) {
                var pdfs = _.where(response, { extension: ".pdf" });
                vm.barcodeDocuments = pdfs;
              }
              vm.gettinDocuments = false;
            });
        }
        vm.$onInit = function () {
          if (vm.barcode) {
            __fetchDocuments();
          } else {
            vm.gettinDocuments = false;
          }
        };
      },
    ],
    controllerAs: "vm",
  };
  angular
    .module("fpm")
    .component("orderDocumentsListComponent", componentConfig);
})();
