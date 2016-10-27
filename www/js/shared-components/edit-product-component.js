(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            isEstimate: "<",
            product: "="
        },
        templateUrl: "js/shared-components/edit-product-component-template.html",
        controller: ["$scope", "work-orders-factory", function ($scope, workOrdersFactory) {
            var vm = this;
            vm.events = {
                updateProductClick: function () {
                    console.log("HELLO WORLD");
                }
            };
        }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("editProductComponent", componentConfig);
})();