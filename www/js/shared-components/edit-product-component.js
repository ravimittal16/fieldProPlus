(function () {
  "use strict";
  var componentConfig = {
    bindings: {
      isEstimate: "<",
      onAddProductCompleted: "&",
      modalType: "<",
      product: "="
    },
    templateUrl: "js/shared-components/edit-product-component-template.html",
    controller: [
      "$scope",
      "$stateParams",
      "$rootScope",
      "work-orders-factory",
      "authenticationFactory",
      "fpm-utilities-factory",
      "shared-data-factory",
      "estimates-factory",
      "inventory-data-factory",
      function (
        $scope,
        $stateParams,
        $rootScope,
        workOrdersFactory,
        authenticationFactory,
        fpmUtilitiesFactory,
        sharedDataFactory,
        estimatesFactory,
        inventoryDataFactory
      ) {
        var vm = this;
        vm.containers = [];
        vm.user = authenticationFactory.getLoggedInUserInfo();
        vm.errors = [];
        var alerts = fpmUtilitiesFactory.alerts;
        vm.events = {
          closeProductEditModal: function () {
            $rootScope.$broadcast("$fpm:closeEditProductModal");
          },
          updateProductClick: function () {
            if (vm.modalType === 0) {
              var promise = vm.isEstimate ?
                estimatesFactory.updateProduct :
                workOrdersFactory.updateProduct;
              if (vm.user.inventoryOn === true) {
                inventoryDataFactory
                  .getProductContainers(vm.product.num)
                  .then(function (response) {
                    if (
                      response != null &&
                      response.collection != null &&
                      response.collection.length > 0
                    ) {
                      vm.containers = response.collection;
                      var container = _.filter(vm.containers, function (c) {
                        return c.userId === vm.user.userEmail;
                      });
                      if (container) {
                        if (vm.product.qty > container[0].qoh) {
                          vm.errors.push("Maximum quantity can be added is only " + container[0].qoh);
                          return false;
                        } else {
                          vm.errors = [];
                          fpmUtilitiesFactory
                            .showLoading("updating product...")
                            .then(function () {
                              promise(vm.product)
                                .then(function (response) {
                                  $scope.$emit("$fpm:operation:updateProduct", response);
                                  alerts.alert(
                                    "Success",
                                    "Product has been updated successfully."
                                  );
                                })
                                .finally(fpmUtilitiesFactory.hideLoading);
                            });
                        }
                      }
                    }
                  });
              } else {
                fpmUtilitiesFactory
                  .showLoading("updating product...")
                  .then(function () {
                    promise(vm.product)
                      .then(function (response) {
                        $scope.$emit("$fpm:operation:updateProduct", response);
                        alerts.alert(
                          "Success",
                          "Product has been updated successfully."
                        );
                      })
                      .finally(fpmUtilitiesFactory.hideLoading);
                  });
              }

            } else {
              vm.product.barCode = $stateParams.barCode;
              vm.product.quantity = vm.product.qty;
              vm.product.markup = vm.product.markup;
              vm.product.FromListWindow = true;
              if (vm.user.inventoryOn === true) {
                inventoryDataFactory
                  .getProductContainers(vm.product.num)
                  .then(function (response) {
                    if (
                      response != null &&
                      response.collection != null &&
                      response.collection.length > 0
                    ) {
                      vm.containers = response.collection;
                      var container = _.filter(vm.containers, function (c) {
                        return c.userId === vm.user.userEmail;
                      });
                      if (container) {
                        if (vm.product.qty > container[0].qoh) {
                          vm.errors.push("Maximum quantity can be added is only " + container[0].qoh);
                          return false;
                        } else {
                          vm.errors = [];
                          fpmUtilitiesFactory.showLoading().then(function () {
                            workOrdersFactory
                              .addProduct(vm.product)
                              .then(function (response) {
                                if (angular.isFunction(vm.onAddProductCompleted)) {
                                  vm.onAddProductCompleted({
                                    product: response
                                  });
                                } else {
                                  $rootScope.$broadcast(
                                    "$fpm:operation:addProduct",
                                    response
                                  );
                                }
                              })
                              .finally(fpmUtilitiesFactory.hideLoading);
                          });
                        }
                      }
                    }
                  });
              } else {
                fpmUtilitiesFactory.showLoading().then(function () {
                  workOrdersFactory
                    .addProduct(vm.product)
                    .then(function (response) {
                      if (angular.isFunction(vm.onAddProductCompleted)) {
                        vm.onAddProductCompleted({
                          product: response
                        });
                      } else {
                        $rootScope.$broadcast(
                          "$fpm:operation:addProduct",
                          response
                        );
                      }
                    })
                    .finally(fpmUtilitiesFactory.hideLoading);
                });
              }

            }
          }
        };

        vm.$onInit = function () {
          sharedDataFactory.getIniitialData().then(function (response) {
            vm.enableMarkupOrders =
              response.customerNumberEntity.enableMarkupForWorkOrders || false;
          });
          vm.user.showPrice = true;
        };
      }
    ],
    controllerAs: "vm"
  };
  angular.module("fpm").component("editProductComponent", componentConfig);
})();
