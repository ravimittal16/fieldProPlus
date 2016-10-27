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
                    console.log("HELLO WORLD FROM");
                }
            };
        }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("editProductComponent", componentConfig);
})();