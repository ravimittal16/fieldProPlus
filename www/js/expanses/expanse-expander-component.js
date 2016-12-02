(function () {
    angular.module("fpm").component("expanseExpanderComponent", {
        bindings: {
            barcode: "<"
        },
        controller: ["$scope", function ($scope) { 
            var vm = this;
        }],
        controllerAs: "vm",
        templateUrl: "js/expanses/expanse-expander-component-template.html"
    })
})();