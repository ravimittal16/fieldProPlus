(function () {
  "use strict";
  var componentConfig = {
    bindings: {
      container: "="
    },
    templateUrl: "js/inventory/edit-container-component-template.html",
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
        vm.events = {
          closeContainerModal: function () {
            $rootScope.$broadcast("$fpm:closeEditContainerModal");
          },
          updateProductQuantity: function (container) {
            inventoryDataFactory.updateProductQuantity(container).then(function (response) {
              if (response.errors == null) {
                $scope.$emit("$fpm:operation:updateProductContainerQuantity", response);
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
  angular.module("fpm").component("editContainerComponent", componentConfig);
})();
