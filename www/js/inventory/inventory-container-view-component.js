(function () {
  "use strict";
  var componentConfig = {
    templateUrl: "js/inventory/inventory-container-view-component.html",
    controller: [
      "$scope",
      "$timeout",
      "$ionicModal",
      "fpm-utilities-factory",
      "work-orders-factory",
      "authenticationFactory",
      "inventory-data-factory",

      function (
        $scope,
        $timeout,
        $ionicModal,
        fpmUtilitiesFactory,
        workOrderFactory,
        authenticationFactory,
        inventoryDataFactory
      ) {
        var vm = this;
        vm.products = [];
        vm.containers = [];
        vm.container = null;
        var timer = null;
        vm.disabled = false;
        vm.loadingContainers = false;
        vm.user = authenticationFactory.getLoggedInUserInfo();
        vm.isServiceProvider = !vm.user.isAdminstrator;
        vm.showButtons = false;

        vm.productContainer = {
          num: "",
          containerName: "",
          description: "",
          assignedTo: "",
          customerNumber: "",
          qoh: "",
          productId: "",
          lastUpdatedDate: "",
          userName: ""
        };
        getContainers();

        function openEditProductQuantityModal() {
          if (vm.productModal) {
            vm.productModal.show();
          } else {
            fpmUtilitiesFactory
              .getModal("editProductModal.html", $scope)
              .then(function (modal) {
                vm.productModal = modal;
                vm.productModal.show();
              });
          }
        }

        function getContainers() {
          vm.loadingContainers = true;
          inventoryDataFactory.getContainers().then(function (response) {
            if (response) {
              vm.containers = response;
              vm.loadingContainers = false;
            }
          });
        }

        $scope.$on("$fpm:closeEditProductQuantityModal", function () {
          if (vm.productModal) {
            vm.productModal.hide();
          }
          if (timer) $timeout.cancel(timer);
        });
        $scope.$on("$fpm:operation:updateContainerProductQuantity", function (
          $event,
          args
        ) {
          inventoryDataFactory
            .getContainerProducts(vm.container.containerName)
            .then(function (response) {
              if (response.collection != null && response.collection.length > 0)
                vm.products = response.collection;
              if (vm.isServiceProvider) {
                angular.forEach(vm.products, function (key, value) {
                  if (vm.container.userId === vm.user.userEmail) {
                    vm.showButtons = true;
                  } else {
                    vm.showButtons = false;
                  }
                });

              }

            });
          vm.productModal.hide();
        });

        vm.events = {
          onSelectedContainerChange: function () {
            vm.loadingContainers = true;
            vm.products = [];
            inventoryDataFactory
              .getContainerProducts(vm.container.containerName)
              .then(function (response) {
                if (
                  response != null &&
                  response.collection != null &&
                  response.collection.length > 0
                ) {
                  vm.products = response.collection;
                  vm.loadingContainers = false;
                  if (vm.isServiceProvider) {
                    angular.forEach(vm.products, function (key, value) {
                      if (vm.container.userId === vm.user.userEmail) {
                        vm.showButtons = true;
                      } else {
                        vm.showButtons = false;
                      }
                    });

                  }

                } else {
                  vm.products = [];
                  vm.loadingContainers = false;
                }
              });
          },
          editProductClick: function (product) {
            vm.currentProduct = angular.copy(product);
            openEditProductQuantityModal();
          },
          increaseQuantity: function (container) {
            vm.disabled = true;
            container.quantity += 1;
            vm.productContainer = {
              num: container.productContainerNum,
              customerNumber: container.customerNumber,
              qoh: container.quantity,
              productId: container.productNumber
            };
            inventoryDataFactory
              .updateProductQuantity(vm.productContainer)
              .then(function (response) {
                if (response.errors == null) {
                  inventoryDataFactory
                    .getContainerProducts(vm.container.containerName)
                    .then(function (response) {
                      if (
                        response.collection != null &&
                        response.collection.length > 0
                      ) {
                        vm.products = response.collection;
                        vm.disabled = false;
                        if (vm.isServiceProvider) {
                          angular.forEach(vm.products, function (key, value) {
                            if (vm.container.userId === vm.user.userEmail) {
                              vm.showButtons = true;
                            } else {
                              vm.showButtons = false;
                            }
                          });

                        }

                      }
                    });
                }
              });
          },
          decreaseQuantity: function (container) {
            vm.disabled = true;
            if (container.quantity > 0) {
              container.quantity -= 1;
            }
            vm.productContainer = {
              num: container.productContainerNum,
              customerNumber: container.customerNumber,
              qoh: container.quantity,
              productId: container.productNumber
            };
            inventoryDataFactory
              .updateProductQuantity(vm.productContainer)
              .then(function (response) {
                if (response.errors == null) {

                  inventoryDataFactory
                    .getContainerProducts(vm.container.containerName)
                    .then(function (response) {
                      if (
                        response.collection != null &&
                        response.collection.length > 0
                      ) {
                        vm.products = response.collection;
                        vm.disabled = false;
                        if (vm.isServiceProvider) {
                          angular.forEach(vm.products, function (key, value) {
                            if (vm.container.userId === vm.user.userEmail) {
                              vm.showButtons = true;
                            } else {
                              vm.showButtons = false;
                            }
                          });

                        }

                      }
                    });
                }
              });
          }
        };
      }
    ],
    controllerAs: "vm"
  };
  angular
    .module("fpm")
    .component("inventoryContainerViewComponent", componentConfig);
})();
