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
        controller: ["$scope", "$stateParams", "$rootScope", "work-orders-factory", "authenticationFactory", "fpm-utilities-factory",
            "shared-data-factory", function ($scope, $stateParams, $rootScope, workOrdersFactory, authenticationFactory, fpmUtilitiesFactory,
                sharedDataFactory) {
                var vm = this;
                vm.user = authenticationFactory.getLoggedInUserInfo();

                vm.events = {
                    closeProductEditModal: function () {
                        $rootScope.$broadcast("$fpm:closeEditProductModal");
                    },
                    updateProductClick: function () {
                        if (vm.modalType === 0) {
                            var promise = vm.isEstimate ? null : workOrdersFactory.updateProduct;
                            fpmUtilitiesFactory.showLoading("updating product...").then(function () {
                                promise(vm.product).then(function (response) {
                                    $scope.$emit("$fpm:operation:updateProduct", response);
                                }).finally(fpmUtilitiesFactory.hideLoading);
                            });
                        } else {
                            vm.product.barCode = $stateParams.barCode;
                            vm.product.quantity = vm.product.qty;
                            vm.product.markup = vm.product.markup;
                            vm.product.FromListWindow = true;
                            fpmUtilitiesFactory.showLoading().then(function () {
                                workOrdersFactory.addProduct(vm.product).then(function (response) {
                                    if (angular.isFunction(vm.onAddProductCompleted)) {
                                        vm.onAddProductCompleted({ product: response });
                                    } else {
                                        $rootScope.$broadcast("$fpm:operation:addProduct", response);
                                    }
                                }).finally(fpmUtilitiesFactory.hideLoading);
                            });
                        }
                    }
                };


                vm.$onInit = function () {
                    sharedDataFactory.getIniitialData().then(function (response) {
                        vm.enableMarkupOrders = response.customerNumberEntity.enableMarkupForWorkOrders || false;
                    });
                }
            }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("editProductComponent", componentConfig);
})();