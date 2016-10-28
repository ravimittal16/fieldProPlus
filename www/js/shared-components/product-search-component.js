(function () {
    "use strict";
    var componentConfig = {
        templateUrl: "js/shared-components/product-search-component-template.html",
        controller: ["$scope", "work-orders-factory", function ($scope, workOrderFactory) {
            var vm = this;
            vm.searchValue = "";
            vm.products = [];
            vm.events = {
                applySearch: function () {
                    workOrderFactory.searchProduct(vm.searchValue, "").then(function (response) {
                        vm.products = response;
                    });
                },
                closeSearchModal: function () { }
            };
        }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("productSearchComponent", componentConfig);
})()