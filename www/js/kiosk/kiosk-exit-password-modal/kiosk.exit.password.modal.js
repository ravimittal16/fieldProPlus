(function () {
    "use strict";
    var componentConfig = {
        bindings: {},
        controller: [
            "$scope",
            "$state",
            "$timeout",
            "fpm-utilities-factory",
            "timecard-factory",
            function (
                $scope,
                $state,
                $timeout,
                fpmUtilitiesFactory,
                timecardFactory
            ) {
                var vm = this;
                vm.exitPassword = "";
                vm.events = {
                    closeKioskModal: function () {
                        $scope.$emit("$kiosk:cancelExitModal");
                    },
                    exitKioskMode: function (isValid) {
                        if (isValid) {
                            timecardFactory
                                .allowExitKiosk(vm.exitPassword)
                                .then(function (allowExit) {
                                    if (allowExit) {
                                        $state.go("app.dashboard", {
                                            refresh: true
                                        });
                                    }
                                });
                        }
                    }
                };

                vm.$onInit = function () {};
            }
        ],
        controllerAs: "vm",
        templateUrl:
            "js/kiosk/kiosk-exit-password-modal/kiosk.exit.password.modal.html"
    };
    angular.module("fpm").component("kioskExitModal", componentConfig);
})();
