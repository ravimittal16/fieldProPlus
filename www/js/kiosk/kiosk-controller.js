(function () {
    "use strict";
    function initController(
        $state,
        $timeout,
        $scope,
        fpmUtilities,
        timecardFactory
    ) {
        var vm = this;
        var alerts = fpmUtilities.alerts;
        /**
        * VIEW TYPES
         0 = KIOSK KEYPAD (DEFAULT)
         1 = KIOSK ACTIONS (CLOCK-IN | OUT)
        */
        vm.viewType = 0;
        vm.kioskUser = null;
        vm.kioskFeatureEnabled = false;
        vm.checkingFeatureAccess = false;
        var KioskExitModal = null;
        function __changeView(kioskUser) {
            vm.kioskUser = kioskUser;
            vm.viewType = 1;
        }

        function __openKioskKeypadView() {
            vm.viewType = 0;
            vm.kioskUser = null;
        }

        vm.events = {
            backKioskClicked: function () {
                __openKioskKeypadView();
            },
            exitKioskClicked: function () {
                if (vm.checkingFeatureAccess) {
                    fpmUtilities.alerts.confirm(
                        "Exit Kiosk",
                        "Are you sure?",
                        function () {
                            fpmUtilities
                                .getModal("kioskExitModal.html", $scope)
                                .then(function (modal) {
                                    KioskExitModal = modal;
                                    KioskExitModal.show();
                                });
                        }
                    );
                } else {
                    $state.go("app.dashboard", {
                        refresh: true
                    });
                }
            }
        };

        function __checkifKioskEnabled() {
            vm.checkingFeatureAccess = true;
            fpmUtilities.showLoading().then(function () {
                timecardFactory
                    .checkifKioskEnabled(false)
                    .then(function (response) {
                        vm.kioskFeatureEnabled = response;
                        vm.checkingFeatureAccess = false;
                    })
                    .finally(function () {
                        fpmUtilities.hideLoading();
                    });
            });
        }

        __checkifKioskEnabled();

        $scope.$on("$kiosk:cancelExitModal", function (event, args) {
            if (KioskExitModal) {
                KioskExitModal.hide();
                $timeout(function () {
                    KioskExitModal.remove();
                }, 100);
            }
        });

        $scope.$on("modal.hidden", function (event) {});

        $scope.$on("$destroy", function () {
            if (KioskExitModal) {
                KioskExitModal.remove();
            }
        });

        $scope.$on("$timecard.showKioskKeypadView", function () {
            __openKioskKeypadView();
        });

        $scope.$on(
            "$timecard.onKioskUserVerificationCompleted",
            function (event, args) {
                if (args) {
                    __changeView(args);
                }
            }
        );
    }
    initController.$inject = [
        "$state",
        "$timeout",
        "$scope",
        "fpm-utilities-factory",
        "timecard-factory"
    ];
    angular.module("fpm").controller("kiosk-controller", initController);
})();
