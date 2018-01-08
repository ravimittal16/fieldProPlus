(function () {
  "use strict";
  var componentConfig = {
    templateUrl: "js/inventory/inventory-search-component.html",
    controller: ["$scope", "$timeout", "$ionicModal", "fpm-utilities-factory", "work-orders-factory", "authenticationFactory", "inventory-data-factory",

      function ($scope, $timeout, $ionicModal, fpmUtilitiesFactory, workOrderFactory, authenticationFactory, inventoryDataFactory) {
        var vm = this;
        vm.searchValue = "";
        vm.products = [];
        vm.containers = [];
        var timer = null;
        vm.user = authenticationFactory.getLoggedInUserInfo();
        vm.isServiceProvider = !vm.user.isAdminstrator;

        function openContainerModal() {
          if (vm.containerModal) {
            vm.containerModal.show();
          } else {
            fpmUtilitiesFactory.getModal("editContainerModal.html", $scope).then(function (modal) {
              vm.containerModal = modal;
              vm.containerModal.show();
            });
          }
        }
        $scope.$on("$fpm:closeEditContainerModal", function () {
          if (vm.containerModal) {
            vm.containerModal.hide();
          }
          if (timer) $timeout.cancel(timer);
        });
        $scope.$on("$fpm:operation:updateProductContainerQuantity", function ($event, args) {
          inventoryDataFactory.getProductContainers(args.entity.productId).then(function (response) {
            if (response.collection != null && response.collection.length > 0)
              vm.containers = response.collection;
          });
          vm.containerModal.hide();
        });
        vm.events = {
          applySearch: function () {
            vm.products = [];
            vm.searchApplied = false;
            vm.runningSearch = true;
            workOrderFactory.searchProduct(vm.searchValue, "").then(function (response) {
              vm.searchApplied = true;
              vm.runningSearch = false;
              if (angular.isArray(response)) {
                vm.products = response;
              }
            });
          },
          onProductItemClicked: function (product) {
            vm.searchValue = product.productName;
            vm.products = [];
            inventoryDataFactory.getProductContainers(product.num).then(function (response) {
              if (response.collection != null && response.collection.length > 0)
                vm.containers = response.collection;
            });

          },
          cancelSearch: function () {
            vm.searchValue = '';
            vm.products = [];
            vm.containers = [];
          },
          editContainerClick: function (container) {
            vm.currentContainer = angular.copy(container);
            openContainerModal();
          },
          increaseQuantity: function (container) {
            container.qoh += 1;
            inventoryDataFactory.updateProductQuantity(container).then(function (response) {
              if (response.errors == null) {
                inventoryDataFactory.getProductContainers(args.entity.productId).then(function (response) {
                  if (response.collection != null && response.collection.length > 0)
                    vm.containers = response.collection;
                });
              }
            });
          },
          decreaseQuantity: function (container) {
            if (container.qoh > 0) {
              container.qoh -= 1;
            }
            inventoryDataFactory.updateProductQuantity(container).then(function (response) {
              if (response.errors == null) {
                inventoryDataFactory.getProductContainers(args.entity.productId).then(function (response) {
                  if (response.collection != null && response.collection.length > 0)
                    vm.containers = response.collection;
                });
              }
            });
          }

        };
      }
    ],
    controllerAs: "vm"
  };
  angular.module("fpm").component("inventorySearchComponent", componentConfig);
})();
