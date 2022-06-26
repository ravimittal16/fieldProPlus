(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            kioskUser: "<"
        },
        templateUrl:
            "js/kiosk/kiosk-actions-component/kiosk-actions-component.html",
        controller: [
            "$timeout",
            "$scope",
            "fpm-utilities-factory",
            "timecard-factory",
            "shared-data-factory",
            function (
                $timeout,
                $scope,
                fpmUtilitiesFactory,
                timecardFactory,
                sharedDataFactory
            ) {
                var vm = this;
                var maxImageSize = 10 * 1024 * 1024;
                vm.currentDate = new Date();
                var __clockIn = false;
                var toDateString = fpmUtilitiesFactory.toStringDate;
                vm.userClockInDetails = null;
                vm.buttonViewType = {
                    clockInButton: true,
                    clockOutButton: false
                };
                vm.isRunning = false;

                function __clockInOutUser(imageFile, clockIn) {
                    var tcd = new Date();
                    var entity = angular.copy(vm.kioskUser);
                    entity.clientTime = kendo.toString(
                        new Date(
                            tcd.getFullYear(),
                            tcd.getMonth(),
                            tcd.getDate(),
                            tcd.getHours(),
                            tcd.getMinutes(),
                            0,
                            0
                        ),
                        "g"
                    );

                    if (
                        !clockIn &&
                        vm.userClockInDetails &&
                        vm.userClockInDetails.num
                    ) {
                        entity.clockInNum = vm.userClockInDetails.num;
                        entity.hasClockInNumber = true;
                        entity.numFromSummary =
                            vm.userClockInDetails.numFromSummary;
                    }

                    fpmUtilitiesFactory
                        .showLoading("Please wait...")
                        .then(function () {
                            timecardFactory
                                .kioskClockInOut(
                                    [
                                        {
                                            rawFile: imageFile
                                        }
                                    ],
                                    entity,
                                    entity.userNum,
                                    clockIn
                                )
                                .then(function (response) {
                                    if (response && response.timeCardDetails) {
                                        timecardFactory.updateUserKioskCache(
                                            response.timeCardDetails,
                                            vm.kioskUser.userNum
                                        );
                                    }
                                    $scope.$emit(
                                        "$timecard.showKioskKeypadView"
                                    );
                                })
                                .finally(function () {
                                    fpmUtilitiesFactory.hideLoading();
                                });
                        });
                }

                function __updateUserClockStatusUI(details) {
                    vm.buttonViewType.clockInButton = true;
                    vm.buttonViewType.clockOutButton = false;
                    vm.userClockInDetails = null;
                    if (details && details.length > 0) {
                        var hasOpenedClockIn = _.findWhere(details, {
                            jobCode: 5001,
                            finishTime: null
                        });
                        if (
                            hasOpenedClockIn !== null &&
                            hasOpenedClockIn !== undefined
                        ) {
                            vm.buttonViewType.clockInButton = false;
                            vm.buttonViewType.clockOutButton = true;
                            vm.userClockInDetails = hasOpenedClockIn;
                        }
                    }
                }

                vm.events = {
                    clockInOutUser: function (clockIn) {
                        __clockIn = clockIn;
                        fpmUtilitiesFactory.device
                            .getPicture(true)
                            .then(function (imageData) {
                                if (imageData) {
                                    sharedDataFactory
                                        .convertToBlob(
                                            "data:image/jpeg;base64," +
                                                imageData,
                                            clockIn
                                                ? "CLOCK_IN.jpeg"
                                                : "CLOCK_OUT.jpeg"
                                        )
                                        .then(function (imageFile) {
                                            if (imageFile) {
                                                __clockInOutUser(
                                                    imageFile,
                                                    clockIn
                                                );
                                            }
                                        });
                                }
                            });
                    }
                };
                function __getUserClockInOutStatus() {
                    if (vm.kioskUser) {
                        fpmUtilitiesFactory
                            .showLoading("Please wait...")
                            .then(function () {
                                var __dt = new Date();
                                timecardFactory
                                    .getTimeCardByDate(
                                        toDateString(__dt),
                                        vm.kioskUser.userName
                                    )
                                    .then(function (response) {
                                        if (
                                            response &&
                                            response.timeCardDetails &&
                                            response.timeCardDetails.length > 0
                                        ) {
                                            timecardFactory.updateUserKioskCache(
                                                response.timeCardDetails,
                                                vm.kioskUser.userNum
                                            );

                                            __updateUserClockStatusUI(
                                                response.timeCardDetails
                                            );
                                        } else {
                                            __updateUserClockStatusUI(null);
                                        }
                                    })
                                    .finally(function () {
                                        fpmUtilitiesFactory.hideLoading();
                                    });
                            });
                    }
                }

                vm.$onInit = function () {
                    __getUserClockInOutStatus();
                };

                $scope.$on("$destroy", function () {});
            }
        ],
        controllerAs: "vm"
    };

    angular.module("fpm").component("kioskActions", componentConfig);
})();
