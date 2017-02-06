(function () {
    "use strict";
    var componentConfig = {
        templateUrl: "js/shared-components/product-search-component-template.html",
        controller: ["$scope", "$timeout", "$ionicModal", "fpm-utilities-factory", "work-orders-factory", "authenticationFactory",
            function ($scope, $timeout, $ionicModal, fpmUtilitiesFactory, workOrderFactory, authenticationFactory) {
                var vm = this;
                vm.searchValue = "";
                vm.products = [];
                var timer = null;
                vm.user = authenticationFactory.getLoggedInUserInfo();
                vm.events = {
                    closeProductEditModal: function () {
                        if (vm.productModal) {
                            vm.productModal.hide();
                        }
                    },
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
                        vm.currentProduct = angular.copy(product);
                        vm.currentProduct.qty = 1;
                        vm.currentProduct.markup = 0;
                        if (vm.productModal) {
                            vm.productModal.show().then(function () {
                                
                            });
                        }
                    },
                    closeSearchModal: function () {
                        $scope.$emit("$fpm:closeProductSearchModal", { fromProductAdd: false });
                    },
                    onAddProductCompleted: function (product) {
                        vm.productModal.hide();
                        timer = $timeout(function () {
                            $scope.$emit("$fpm:closeProductSearchModal", { fromProductAdd: true });
                        }, 100);
                    }
                };

                $scope.$on("$fpm:closeEditProductModal", function () {
                    if (vm.productModal) {
                        vm.productModal.hide();
                    }
                    if (timer) $timeout.cancel(timer);
                });

                fpmUtilitiesFactory.getModal("addProductModal.html", $scope).then(function (modal) {
                    vm.productModal = modal;
                });
            }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("productSearchComponent", componentConfig);
})();