(function() {
  "use strict";
  var componentConfig = {
    bindings: {
      barcode: "<",
      isEstimate: "<"
    },
    templateUrl: "js/work-orders/order-signature-card-component.template.html",
    controller: [
      "$scope",
      "$stateParams",
      "$timeout",
      "authenticationFactory",
      "fieldPromaxConfig",
      function(
        $scope,
        $stateParams,
        $timeout,
        authenticationFactory,
        fieldPromaxConfig
      ) {
        var vm = this;
        var estimateId = 0;
        vm.showingSignaturePad = false;
        var baseUrl = fieldPromaxConfig.fieldPromaxApi;
        var user = authenticationFactory.getLoggedInUserInfo();
        vm.signPadEvents = null;
        vm.showEmptySignatureMessage = false;

        function tryLoadImage() {
          vm.imageUrl =
            baseUrl +
            "Handlers/GetBarcodeSignature.ashx?barcode=" +
            vm.barcode +
            "&dateStamp=" +
            new Date() +
            "&customernumber=" +
            user.customerNumber +
            "&estimate=" +
            vm.isEstimate +
            "&estimateId=" +
            estimateId;
        }

        vm.events = {
          closeSignaturePad: function() {
            vm.showingSignaturePad = false;

            $timeout(function() {
              tryLoadImage();
            }, 100);
          },
          saveSignature: function() {
            if (vm.signPadEvents) {
              vm.signPadEvents.trySaveSignature().then(function(response) {
                if (response === true) {
                  vm.showingSignaturePad = false;
                  tryLoadImage();
                }
              });
            }
          },
          onSignatureActionButtonClicked: function() {
            vm.showingSignaturePad = true;
            tryLoadImage();
          }
        };
        $scope.$on("fpm:showEmptyImageMessage", function(event, value) {
          vm.showEmptySignatureMessage = value;
        });

        $scope.$on("$signature:completedEvent", function() {
          vm.showingSignaturePad = false;
        });
        vm.imageUrl = baseUrl + "Handlers/GetBarcodeSignature.ashx?barcode";
        vm.$onInit = function() {
          if (vm.isEstimate) {
            estimateId = $stateParams.id;
          }
          vm.imageUrl =
            baseUrl +
            "Handlers/GetBarcodeSignature.ashx?barcode=" +
            vm.barcode +
            "&dateStamp=" +
            new Date() +
            "&customernumber=" +
            user.customerNumber +
            "&estimate=" +
            vm.isEstimate +
            "&estimateId=" +
            estimateId;
        };
      }
    ],
    controllerAs: "vm"
  };
  angular.module("fpm").component("orderSignatureComponent", componentConfig);
})();
