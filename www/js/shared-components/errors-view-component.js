(function () {
    "use strict";
    angular.module("fpm").component("errorsView", {
        bindings: {
            errors: "<"
        }, templateUrl: "js/shared-components/errors-view-component-template.html",
        controllerAs: [function () {
            var vm = this;
        }],
        controllerAs: "vm"
    });
})();