(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            displayName: "<"
        },
        templateUrl:
            "js/customer/display-name-component/display.name.component.html",
        controller: [
            "$timeout",
            "$scope",
            "fpm-utilities-factory",
            function ($timeout, $scope, fpmUtilitiesFactory) {
                var vm = this;
                vm.customerNotesModal = null;

                vm.events = {
                    onDisplayNameLinkClicked: function () {
                        if (vm.customerNotesModal) {
                            vm.customerNotesModal.show();
                        } else {
                            fpmUtilitiesFactory
                                .getModal("customerNotesModal.html", $scope)
                                .then(function (modal) {
                                    vm.customerNotesModal = modal;
                                    vm.customerNotesModal.show();
                                });
                        }
                    }
                };
                vm.$onInit = function () {};

                $scope.$on("$destroy", function () {
                    if (vm.customerNotesModal) {
                        vm.customerNotesModal.remove();
                    }
                });
            }
        ],
        controllerAs: "vm"
    };

    angular.module("fpm").component("displayName", componentConfig);
})();
