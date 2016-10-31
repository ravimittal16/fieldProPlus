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
        controller: ["$scope", "$stateParams", "$rootScope", "work-orders-factory", "authenticationFactory",
            function ($scope, $stateParams, $rootScope, workOrdersFactory, authenticationFactory) {
                var vm = this;
                vm.user = authenticationFactory.getLoggedInUserInfo();

                vm.events = {
                    closeProductEditModal: function () {
                        $rootScope.$broadcast("$fpm:closeEditProductModal");
                    },
                    updateProductClick: function () {
                        if (vm.modalType === 0) {
                            var promise = vm.isEstimate ? null : workOrdersFactory.updateProduct;
                            promise(vm.product).then(function (response) {
                                $scope.$emit("$fpm:operation:updateProduct", response);
                            });
                        } else {
                            vm.product.BarCode = $stateParams.barCode;
                            vm.product.Quantity = vm.product.qty;
                            vm.product.FromListWindow = true;
                            workOrdersFactory.addProduct(vm.product).then(function (response) {
                                if (angular.isFunction(vm.onAddProductCompleted)) {
                                    vm.onAddProductCompleted({ product: response });    
                                } else {
                                    $rootScope.$broadcast("$fpm:operation:addProduct", response);
                                }
                            });
                        }
                    }
                };
            }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("editProductComponent", componentConfig);
})();