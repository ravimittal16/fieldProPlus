(function () {
  "use strict";
  var componentConfig = {
    bindings: {
      product: "="
    },
    templateUrl: "js/inventory/edit-container-product-component.html",
    controller: [
      "$scope",
      "$stateParams",
      "$rootScope",
      "authenticationFactory",
      "fpm-utilities-factory",
      "shared-data-factory",
      "inventory-data-factory",
      function (
        $scope,
        $stateParams,
        $rootScope,
        authenticationFactory,
        fpmUtilitiesFactory,
        sharedDataFactory,
        inventoryDataFactory
      ) {
        var vm = this;
        vm.user = authenticationFactory.getLoggedInUserInfo();
        var alerts = fpmUtilitiesFactory.alerts;
        vm.productContainer = {
          num: '',
          containerName: '',
          description: '',
          assignedTo: '',
          customerNumber: '',
          qoh: '',
          productId: '',
          lastUpdatedDate: '',
          userName: ''
        };
        vm.events = {
          closeContainerModal: function () {
            $rootScope.$broadcast("$fpm:closeEditProductQuantityModal");
          },
          updateProductQuantity: function (container) {
            vm.productContainer = {
              num: container.productContainerNum,
              customerNumber: container.customerNumber,
              qoh: container.quantity,
              productId: container.productNumber
            }
            inventoryDataFactory.updateProductQuantity(vm.productContainer).then(function (response) {
              if (response.errors == null) {
                $scope.$emit("$fpm:operation:updateContainerProductQuantity", response);
                alerts.alert(
                  "Success",
                  ""
                );
              }
            });
          }

        };

        vm.$onInit = function () {

        };
      }
    ],
    controllerAs: "vm"
  };
  angular.module("fpm").component("editContainerProductComponent", componentConfig);
})();
