(function () {
    "use strict";
    var componentConfig = {
        templateUrl: "js/work-orders/order-documents-list-component.template.html",
        bindings: {
            barcode: "<"
        },
        controller: ["$scope", function ($scope) {
            var vm = this;
            
         }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("orderDocumentsListComponent", componentConfig);
})();