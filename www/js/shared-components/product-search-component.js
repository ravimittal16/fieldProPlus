(function() {
  "use strict";
  var componentConfig = {
    templateUrl: "js/shared-components/product-search-component-template.html",
    controller: [
      "$scope",
      "$timeout",
      "$ionicModal",
      "fpm-utilities-factory",
      "work-orders-factory",
      "authenticationFactory",
      function(
        $scope,
        $timeout,
        $ionicModal,
        fpmUtilitiesFactory,
        workOrderFactory,
        authenticationFactory
      ) {
        var vm = this;
        vm.searchValue = "";
        vm.products = [];
        var timer = null;
        vm.user = authenticationFactory.getLoggedInUserInfo();
        vm.events = {
          closeProductEditModal: function() {
            if (vm.productModal) {
              vm.searchValue = "";
              vm.vm.searchApplied = false;
              vm.productModal.hide();
            }
          },
          applySearch: function(fromInput) {
            vm.showingLessCount = false;
            if (vm.searchValue !== "") {
              vm.products = [];
              vm.searchApplied = false;
              vm.runningSearch = true;
              workOrderFactory
                .searchProduct(vm.searchValue, "")
                .then(function(response) {
                  vm.searchApplied = true;
                  if (angular.isArray(response)) {
                    vm.products = response;
                    if (response.length > 0) {
                      vm.totalCount = response[0].totalCount;
                      vm.showingLessCount = totalCount > 200;
                    }
                  }
                })
                .finally(function() {
                  vm.runningSearch = false;
                });
            }
          },
          onProductItemClicked: function(product) {
            vm.currentProduct = angular.copy(product);
            vm.currentProduct.qty = 1;
            if (vm.openEditProductModalOnProductSelectedFromSearch) {
              vm.currentProduct.markup = 0;
              if (vm.productModal) {
                vm.productModal.show().then(function() {});
              }
            } else {
              $scope.$emit("$fpm:onProductSelected", product);
            }
          },
          closeSearchModal: function() {
            vm.searchValue = "";
            $scope.$emit("$fpm:closeProductSearchModal", {
              fromProductAdd: false
            });
          },
          onAddProductCompleted: function(product) {
            vm.productModal.hide();
            timer = $timeout(function() {
              $scope.$emit("$fpm:closeProductSearchModal", {
                fromProductAdd: true
              });
            }, 100);
          }
        };

        $scope.$on("$fpm:closeEditProductModal", function() {
          if (vm.productModal) {
            vm.productModal.hide();
            vm.searchValue = "";
          }
          if (timer) $timeout.cancel(timer);
        });

        fpmUtilitiesFactory
          .getModal("addProductModal.html", $scope)
          .then(function(modal) {
            vm.productModal = modal;
          });
        vm.openEditProductModalOnProductSelectedFromSearch = true;
        //When false => this will not open Edit Product Modal on Search
        //false => In Estimates
        $scope.$on("$fpm:changeAddModalOpenPriority", function($event, $args) {
          vm.openEditProductModalOnProductSelectedFromSearch = $args;
        });

        vm.$onInit = function() {};
        vm.$onDestroy = function() {
          console.log("HELLLLL");
        };
      }
    ],
    controllerAs: "vm"
  };
  angular.module("fpm").component("productSearchComponent", componentConfig);
})();
