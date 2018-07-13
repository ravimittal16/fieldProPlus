(function() {
  "use strict";
  var componentConfig = {
    bindings: {
      barcode: "<"
    },
    template:
      '<button class="button button-default button-small" ng-click="vm.doScan()"><i class="ion-qr-scanner"></i></button>',
    controller: [
      "$scope",
      "$cordovaBarcodeScanner",
      "work-orders-factory",
      "fpm-utilities-factory",
      function(
        $scope,
        $cordovaBarcodeScanner,
        workOrdersFactory,
        fpmUtilities
      ) {
        var alerts = fpmUtilities.alerts;
        var vm = this;
        vm.doScan = function() {
          $cordovaBarcodeScanner.scan().then(function(imageData) {
            if (imageData && imageData.text) {
              workOrdersFactory
                .addProductFromBarcodeScanner(imageData.text, vm.barcode)
                .then(function(response) {
                  if (response) {
                    $scope.$emit("$fpm:operation:updateProduct", response);
                  } else {
                    alerts.alert(
                      "Not Found",
                      "No product found with this code..",
                      null
                    );
                  }
                });
            }
          });
        };

        vm.$onInit = function() {};
      }
    ],
    controllerAs: "vm"
  };

  angular.module("fpm").component("scanner", componentConfig);
})();
