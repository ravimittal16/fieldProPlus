(function () {
  "use strict";
  var componentConfig = {
    bindings: {
      product: "="
    },
    templateUrl: "js/inventory/assign-container-component-template.html",
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
        vm.loadingContainers = false;
        vm.containers = [];
        vm.container = null;
        vm.errors = [];
        vm.quantity = 0;
        vm.user = authenticationFactory.getLoggedInUserInfo();
        var alerts = fpmUtilitiesFactory.alerts;
        getContainers();
        vm.events = {
          closeContainerModal: function () {
            $rootScope.$broadcast("$fpm:closeAssignContainerModal");
          },
          assignContainer: function () {
            if (vm.quantity == 0) {
              vm.errors.push("Please input quantity");
              return false;
            } else {
              vm.errors = [];
            }
            vm.container.productId = vm.product.num;
            vm.container.qoh = vm.quantity;
            inventoryDataFactory
              .assignContainerToProduct(vm.container)
              .then(function (response) {
                if (response.errors != null) {
                  vm.errors.push(response.errors[0]);
                } else {
                  vm.errors = [];
                  $scope.$emit(
                    "$fpm:operation:assignContainerToProduct",
                    response
                  );
                  alerts.alert("Success");
                }
              });
          }
        };

        function getContainers() {
          vm.loadingContainers = true;
          inventoryDataFactory.getContainers().then(function (response) {
            if (response) {
              vm.containers = response;
              vm.loadingContainers = false;
            }
          });
        }
        vm.$onInit = function () {};
      }
    ],
    controllerAs: "vm"
  };
  angular.module("fpm").component("assignContainerComponent", componentConfig);
})();
