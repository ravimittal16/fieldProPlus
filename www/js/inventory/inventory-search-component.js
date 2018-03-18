(function () {
  "use strict";
  var componentConfig = {
    templateUrl: "js/inventory/inventory-search-component.html",
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
        vm.disabled = false;
        vm.searchValue = "";
        vm.products = [];
        vm.containers = [];
        vm.productItemClicked = false;
        vm.runningSearch = false;
        var timer = null;
        vm.product = null;
        vm.user = authenticationFactory.getLoggedInUserInfo();
        vm.isServiceProvider = !vm.user.isAdminstrator;
        vm.showButtons = false;
        vm.allContainers = [];
        vm.showDispenseButton = false;



        function checkAssignedContainer() {
          //vm.runningSearch = true;
          inventoryDataFactory.getContainers().then(function (response) {
            if (response) {
              vm.allContainers = response;

              if (vm.isServiceProvider) {
                var assignedContainer = _.filter(vm.allContainers, function (c) {
                  return c.userId === vm.user.userEmail;
                });
                vm.showDispenseButton = assignedContainer.length > 0 ? true : false;
                //vm.runningSearch = false;
              }
            }

          });
        }

        function openAssignContainerModal() {
          if (vm.assignContainerModal) {
            vm.assignContainerModal.show();
          } else {
            fpmUtilitiesFactory
              .getModal("assignContainerModal.html", $scope)
              .then(function (modal) {
                vm.assignContainerModal = modal;
                vm.assignContainerModal.show();
              });
          }
        }

        function openContainerModal() {
          if (vm.containerModal) {
            vm.containerModal.show();
          } else {
            fpmUtilitiesFactory
              .getModal("editContainerModal.html", $scope)
              .then(function (modal) {
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
        $scope.$on("$fpm:closeAssignContainerModal", function () {
          if (vm.assignContainerModal) {
            vm.assignContainerModal.hide();
          }
          if (timer) $timeout.cancel(timer);
        });
        $scope.$on("$fpm:operation:assignContainerToProduct", function (
          $event,
          args
        ) {
          inventoryDataFactory
            .getProductContainers(args.entity.productId)
            .then(function (response) {
              if (response.collection != null && response.collection.length > 0)
                vm.containers = response.collection;
            });
          vm.assignContainerModal.hide();
        });
        $scope.$on("$fpm:operation:updateProductContainerQuantity", function (
          $event,
          args
        ) {
          inventoryDataFactory
            .getProductContainers(args.entity.productId)
            .then(function (response) {
              if (response.collection != null && response.collection.length > 0)
                vm.containers = response.collection;
              if (vm.isServiceProvider) {
                if (vm.containers.length > 0)
                  var assignedContainer = _.filter(vm.containers, function (c) {
                    return c.userId === vm.user.userEmail;
                  });
                vm.showButtons = assignedContainer.length > 0 ? true : false;
              }
            });
          vm.containerModal.hide();
        });
        vm.events = {
          applySearch: function () {
            vm.products = [];
            vm.searchApplied = false;
            vm.runningSearch = true;
            vm.productItemClicked = false;
            vm.containers = [];
            workOrderFactory
              .searchProduct(vm.searchValue, "")
              .then(function (response) {
                vm.searchApplied = true;
                vm.runningSearch = false;
                if (angular.isArray(response)) {
                  vm.products = response;
                }
              });
          },
          onProductItemClicked: function (product) {
            checkAssignedContainer();
            vm.runningSearch = true;
            vm.productItemClicked = true;
            vm.searchApplied = false;
            vm.product = product;
            vm.searchValue = product.productName;
            vm.products = [];
            inventoryDataFactory
              .getProductContainers(product.num)
              .then(function (response) {
                if (
                  response != null &&
                  response.collection != null &&
                  response.collection.length > 0
                ) {
                  vm.containers = response.collection;
                  if (vm.isServiceProvider) {
                    var assignedContainer = _.filter(vm.containers, function (c) {
                      return c.userId === vm.user.userEmail;
                    });
                    vm.showButtons = assignedContainer.length > 0 ? true : false;
                  }

                  vm.runningSearch = false;
                } else {
                  vm.runningSearch = false;
                  vm.containers = [];
                }
              });
          },
          cancelSearch: function () {
            vm.searchValue = "";
            vm.products = [];
            vm.containers = [];
            vm.runningSearch = false;
            vm.productItemClicked = false;
            vm.searchApplied = false;
          },
          editContainerClick: function (container) {
            vm.currentContainer = angular.copy(container);
            openContainerModal();
          },
          assignToContainer: function () {
            openAssignContainerModal();
          },
          increaseQuantity: function (container) {
            vm.disabled = true;
            container.qoh += 1;
            inventoryDataFactory
              .updateProductQuantity(container)
              .then(function (response) {
                if (response.errors == null) {
                  vm.disabled = false;
                  inventoryDataFactory
                    .getProductContainers(args.entity.productId)
                    .then(function (response) {
                      if (
                        response.collection != null &&
                        response.collection.length > 0
                      ) {
                        vm.containers = response.collection;
                        if (vm.isServiceProvider) {
                          var assignedContainer = _.filter(vm.containers, function (c) {
                            return c.userId === vm.user.userEmail;
                          });
                          vm.showButtons = assignedContainer.length > 0 ? true : false;


                        }
                      }
                    });
                }
              });
          },
          decreaseQuantity: function (container) {
            vm.disabled = true;
            if (container.qoh > 0) {
              container.qoh -= 1;
            }
            inventoryDataFactory
              .updateProductQuantity(container)
              .then(function (response) {
                if (response.errors == null) {
                  vm.disabled = false;
                  inventoryDataFactory
                    .getProductContainers(args.entity.productId)
                    .then(function (response) {
                      if (
                        response.collection != null &&
                        response.collection.length > 0
                      ) {
                        vm.containers = response.collection;
                        if (vm.isServiceProvider) {
                          var assignedContainer = _.filter(vm.containers, function (c) {
                            return c.userId === vm.user.userEmail;
                          });
                          vm.showButtons = assignedContainer.length > 0 ? true : false;
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
  angular.module("fpm").component("inventorySearchComponent", componentConfig);
})();
