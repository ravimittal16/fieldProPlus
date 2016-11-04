(function () {
    "use strict";
    var componentConfig = {
        templateUrl: "js/shared-components/product-search-component-template.html",
        controller: ["$scope", "$timeout", "$ionicModal", "work-orders-factory",
            function ($scope, $timeout, $ionicModal, workOrderFactory) {
                var vm = this;
                vm.searchValue = "";
                vm.products = [];
                vm.events = {
                    closeProductEditModal: function () {
                        vm.productModal.hide();
                    },
                    applySearch: function () {
                        workOrderFactory.searchProduct(vm.searchValue, "").then(function (response) {
                            vm.products = response;
                        });
                    },
                    onProductItemClicked: function (product) {
                        vm.currentProduct = angular.copy(product);
                        vm.currentProduct.qty = 1;
                        if (vm.productModal) {
                            vm.productModal.show();
                        }
                    },
                    closeSearchModal: function () {
                        $scope.$emit("$fpm:closeProductSearchModal", { fromProductAdd: false });
                    },
                    onAddProductCompleted: function (product) {
                        vm.productModal.hide();
                        $timeout(function () {
                            $scope.$emit("$fpm:closeProductSearchModal", { fromProductAdd: true });
                        }, 100);
                    }
                };

                $scope.$on("$fpm:closeEditProductModal", function () {
                    vm.productModal.hide();
                });

                $ionicModal.fromTemplateUrl("addProductModal.html", {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    vm.productModal = modal;
                });
                // $scope.$on("$fpm:operation:addProduct", function () {
                //     vm.productModal.hide();
                // });
            }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("productSearchComponent", componentConfig);
})();