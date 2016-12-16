(function () {
    "use strict";
    var componentConfig = {
        templateUrl: "js/shared-components/product-search-component-template.html",
        controller: ["$scope", "$timeout", "$ionicModal", "work-orders-factory", "authenticationFactory",
            function ($scope, $timeout, $ionicModal, workOrderFactory, authenticationFactory) {
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
                        if (vm.productModal) {
                            vm.productModal.show();
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
                    console.log("HEEEE");
                    if (vm.productModal) {
                        vm.productModal.hide();
                    }
                    if (timer) $timeout.cancel(timer);
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