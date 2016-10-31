(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            expense: "="
        },
        template: "HHSKD",
        controller: ["$scope", function ($scope) {
            var vm = this;
            console.log("HELLO WORLD");
        }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("expenseItemComponent", componentConfig)
})();