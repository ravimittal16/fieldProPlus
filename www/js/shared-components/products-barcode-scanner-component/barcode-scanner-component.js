(function () {
  "use strict";
  var componentConfig = {
    bindings: {
      onScanned: "&",
      buttonLabel: "@"
    },
    template: '<button class="button button-default button-small" ng-click="vm.doScan()">{{vm.buttonLabel}}</button>',
    controller: [
      "$cordovaBarcodeScanner",
      function ($cordovaBarcodeScanner) {
        var vm = this;
        vm.doScan = function () {
          $cordovaBarcodeScanner.scan({
            disableAnimations: true
          }).then(function (imageData) {
            if (imageData && imageData.text) {
              if (angular.isFunction(vm.onScanned)) {
                vm.onScanned({
                  skuCode: imageData.text
                });
              }
            }
          });
        };
      }
    ],
    controllerAs: "vm"
  };

  angular.module("fpm").component("scanner", componentConfig);
})();
