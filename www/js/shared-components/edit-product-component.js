(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            isEstimate: "<",
            product: "="
        },
        templateUrl: "js/shared-components/edit-product-component-template.html",
        controller: ["$scope", "work-orders-factory", "authenticationFactory", function ($scope, workOrdersFactory, authenticationFactory) {
            var vm = this;
            vm.user = authenticationFactory.getLoggedInUserInfo();

            vm.events = {
                updateProductClick: function () {
                    var promise = vm.isEstimate ? null : workOrdersFactory.updateProduct;
                    promise(vm.product).then(function (response) {
                        $scope.$emit("$fpm:operation:updateProduct", response);
                    });
                }
            };
        }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("editProductComponent", componentConfig);
})();