(function () {
    "use strict";
    angular.module("fpm").component("expanseItem", {
        bindings: {
            item: "<"
        },
        controller: ["$scope", function () { 
            var vm = this;
        }],
        controllerAs: "vm",
        templateUrl: "js/expanses/expanse-item-template.html"
    })
})();