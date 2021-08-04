(function () {
    "use strict";

    function __detailController(
        $rootScope,
        $scope,
        $timeout,
        workOrdersFactory,
        fpmUtilitiesFactory,
        sharedDataFactory,
        authenticationFactory,
        timecardFactory,
        $ionicPopover,
        $ionicModal,
        $ionicActionSheet
    ) {
        var vm = this;
        vm.pleaseWait = false;
        var __isForWorkOrder = false;
        var __jobCodes = timecardFactory.statics.jobCodes;
        var __statusTypes = timecardFactory.statics.statusTypes;
        var __integrityCustomers = [
            "97713",
            "97719",
            "99009",
            "97678",
            "97636"
        ];
        var __forIntegrityCustomer = false;
        var __userEmail = "";
        var alerts = fpmUtilitiesFactory.alerts;
        vm.assgiendToSameUser = false;
        vm.currentDate = new Date();
        vm.dateFormat = $rootScope.dateFormat;

        function __toDate(dateString) {
            return kendo.parseDate(dateString);
        }

        function __toDateObj(dateFrom, timeFrom) {
            var __timeDate = timeFrom || new Date();
            return new Date(
                dateFrom.getFullYear(),
                dateFrom.getMonth(),
                dateFrom.getDate(),
                __timeDate.getHours(),
                __timeDate.getMinutes(),
                0,
                0
            );
        }

        function __processClockOutUser(
            clockInDateTime,
            __details,
            scheduleNums
        ) {
            var tcd = null;
            if (vm.data.summary && vm.data.summary.timeCardDate) {
                tcd = moment(vm.data.summary.timeCardDate).toDate();
            } else {
                tcd = vm.currentDate;
            }
            var smDt = clockInDateTime ? clockInDateTime : new Date();
            var clockOutTime = __toDateObj(smDt, smDt); //new Date(smDt.getFullYear(), smDt.getMonth(), smDt.getDate(), smDt.getHours(), smDt.getMinutes(), 0, 0);
            var __num = __details ? __details.num : 0;
            var details = {
                num: __num,
                scheduleNums: scheduleNums,
                startTime: __toDateString(clockOutTime),
                jobCode: __jobCodes.CLOCK_OUT,
                numFromSummary: vm.data.summary.num,
                timeCardDate: __toDateString(tcd)
            };
            if (!vm.assgiendToSameUser) {
                details.timecardUserEmailDefined = true;
                details.timecardUserEmail = __userEmail;
            }
            if (vm.data.currentClockedIn) {
                details["uniqueIdentifier"] =
                    vm.data.currentClockedIn.uniqueIdentifier;
            } else {
                details["uniqueIdentifier"] = __details.uniqueIdentifier;
            }
            fpmUtilitiesFactory.showLoading().then(function () {
                timecardFactory
                    .clockInOutUser(details)
                    .then(function (response) {
                        __clearClockInData();
                        if (response && response.errors === null) {
                            __updateTimeCardBindings(response);
                            $rootScope.$broadcast(
                                "$timecard.onclocked-out-fromHeader",
                                response
                            );
                        } else {
                            alerts.alert(
                                "Error",
                                "Not able to perform clock out"
                            );
                        }
                    })
                    .finally(function () {
                        fpmUtilitiesFactory.hideLoading();
                    });
            });
        }

        function __onClockoutClicked(clockInDate, detail, scheduleNums) {
            var notCheckInDetails = _.filter(vm.data.timeCards, function (tc) {
                return (
                    tc.finishTime === null && tc.jobCode !== __jobCodes.CLOCK_IN
                );
            });
            if (notCheckInDetails.length > 0) {
                alerts.confirm(
                    "Confirmation!",
                    "You have a task pending to check out. \n\n Previously pending tasks will be checked out automattically. \n\n Are you sure?",
                    function () {
                        $timeout(function () {
                            __processClockOutUser(
                                clockInDate,
                                detail,
                                scheduleNums
                            );
                        }, 10);
                    }
                );
            } else {
                alerts.confirm("Confirmation!", "Are you sure?", function () {
                    $timeout(function () {
                        __processClockOutUser(
                            clockInDate,
                            detail,
                            scheduleNums
                        );
                    }, 10);
                });
            }
        }
        vm.multipleScheduleCheckInModal = null;
        vm.data = {
            events: {
                clockOutClick: function (clockInDate, detail) {
                    timecardFactory.setClockinData(clockInDate, detail, {
                        data: vm.data
                    });
                    /**
                     * ALLOWED FOR ALL TRAFFIC CONTROLLER CUSTOMERS && INTEGRITY
                     */
                    if (
                        __forIntegrityCustomer ||
                        vm.isTrafficControllerCustomer
                    ) {
                        vm.scheduleActionType = 3;
                        vm.pleaseWait = true;
                        workOrdersFactory
                            .getSchedulesWithSameDateTime(
                                vm.barcode,
                                vm.schedule.num,
                                vm.scheduleActionType
                            )
                            .then(function (response) {
                                if (response === null || response.length <= 1) {
                                    __onClockoutClicked(clockInDate, detail);
                                } else {
                                    fpmUtilitiesFactory
                                        .getModal(
                                            "checkInMultipleSchedulesModal.html",
                                            $scope
                                        )
                                        .then(function (__modal) {
                                            vm.multipleScheduleCheckInModal =
                                                __modal;
                                            vm.multipleScheduleCheckInModal.show();
                                        });
                                }
                            })
                            .finally(function () {
                                vm.pleaseWait = false;
                            });
                    } else {
                        __onClockoutClicked(clockInDate, detail);
                    }
                }
            },
            currentClockedIn: null,
            clockInDateTime: null,
            isClockedOut: false,
            isClockedIn: false,
            timeCards: [],
            clockedInDate: null,
            loading: false
        };

        function __toDateString(dateString) {
            return fpmUtilitiesFactory.toStringDate(dateString);
        }

        function __clearClockInData() {
            vm.data.currentClockedIn = null;
            vm.data.isClockedOut = false;
            vm.data.isClockedIn = false;
            vm.data.timeCards = [];
            vm.data.disableClockInButton = false;
            vm.data.disableClockOutButton = false;
        }

        function __updateTimeCardBindings(details) {
            vm.data.timeCards = details.timeCardDetails;
            vm.data.summary = details.timeCardSummary;
            vm.data.currentClockedIn = _.findWhere(details.timeCardDetails, {
                jobCode: __jobCodes.CLOCK_IN,
                finishTime: null
            });

            if (angular.isDefined(vm.data.currentClockedIn)) {
                var __clockIn = vm.data.currentClockedIn;
                vm.data.clockInDateTime = __toDate(__clockIn.startTime);
                vm.data.isClockedIn = true;
                vm.data.isClockedOut = __clockIn.finishTime !== null;
            } else {
                vm.data.isClockedOut =
                    vm.data.timeCards && vm.data.timeCards.length > 0;
            }
        }

        function __getUserTimeCardByDate() {
            var __dt = __toDateString(vm.currentDate);
            vm.data.loading = true;
            __clearClockInData();
            timecardFactory
                .getTimeCardByDate(__dt, __userEmail)
                .then(function (__res) {
                    if (__res) {
                        __updateTimeCardBindings(__res);
                    }
                })
                .finally(function () {
                    vm.data.loading = false;
                });
        }

        function __ensureScheduleNotAssgiendToCurrentUser(initLoad) {
            if (vm.schedule) {
                vm.barcode = vm.schedule.barcode;
                vm.assgiendToSameUser =
                    vm.schedule &&
                    vm.schedule.technicianNum === vm.user.userEmail;
                vm.currentDate = __toDate(vm.schedule.scheduledStartDateTime);
                vm.userName = __isForWorkOrder
                    ? vm.schedule.technicianName
                    : vm.user.userName;
                __userEmail = vm.assgiendToSameUser
                    ? vm.user.userEmail
                    : vm.schedule.technicianNum;
                $timeout(function () {
                    __getUserTimeCardByDate();
                }, 50);
            }
        }

        vm.$onChanges = function () {
            $timeout(function () {
                __ensureScheduleNotAssgiendToCurrentUser(false);
            }, 100);
        };
        vm.isTrafficControllerCustomer = false;
        vm.$onInit = function () {
            vm.user = authenticationFactory.getLoggedInUserInfo();
            vm.isTrafficControllerCustomer =
                vm.user.isTrafficControllerCustomer || false;
            var __customerNumber = vm.user.customerNumber;
            __forIntegrityCustomer =
                __integrityCustomers.indexOf(__customerNumber) > -1;
            __isForWorkOrder = vm.basedOn === "workorder";
            vm.canChangeTimecardDate = vm.basedOn === "timecard";
            $timeout(function () {
                __ensureScheduleNotAssgiendToCurrentUser(true);
            }, 100);
        };

        function __hideMultipleScheduleModal() {
            if (vm.multipleScheduleCheckInModal) {
                vm.multipleScheduleCheckInModal.hide();
                vm.multipleScheduleCheckInModal.remove();
                vm.multipleScheduleCheckInModal = null;
            }
        }

        $scope.$on(
            "$timecard.onclocked-out-fromComponent",
            function (evnt, __resopnse) {
                $timeout(function () {
                    vm.data.isClockedOut = true;
                    vm.data.isClockedIn = false;
                    vm.data.disableClockOutButton = true;
                    vm.data.addTimeVisibility = false;
                    vm.data.ptoButtonVisibility = true;
                    vm.data.summary = __resopnse.timeCardSummary;
                    __updateTimeCardBindings(__resopnse);
                }, 100);
            }
        );

        $scope.$on("$wo.multipleScheduleModalCancel", function ($event, agrs) {
            __hideMultipleScheduleModal();
        });

        $scope.$on(
            "$wo.multipleScheduleModalCancel.clockout",
            function (evnt, args) {
                __hideMultipleScheduleModal();
                var __data = timecardFactory.getClockinData();
                if (!args.multiple) {
                    __onClockoutClicked(
                        __data.clockInDate,
                        __data.detail,
                        null
                    );
                } else {
                    __onClockoutClicked(
                        __data.clockInDate,
                        __data.detail,
                        args.checkedSchedules
                    );
                }
            }
        );

        $scope.$on("$timecard.onClockedInCompleted", function (evnt, args) {
            $timeout(function () {
                __updateTimeCardBindings(args);
            }, 100);
        });
        $scope.$on("$workOrder.refreshTimecardUI", function (evnt, args) {
            $timeout(function () {
                __getUserTimeCardByDate();
            }, 100);
        });
    }

    var __componentConfig = {
        bindings: {
            basedOn: "@", // workorder | timecard
            schedule: "<"
        },
        controller: __detailController,
        controllerAs: "vm",
        templateUrl: "js/timecard/timecard.clockin.out.header.component.html"
    };

    __detailController.$inject = [
        "$rootScope",
        "$scope",
        "$timeout",
        "work-orders-factory",
        "fpm-utilities-factory",
        "shared-data-factory",
        "authenticationFactory",
        "timecard-factory",
        "$ionicPopover",
        "$ionicModal",
        "$ionicActionSheet"
    ];
    angular.module("fpm").component("timecardClockInHeader", __componentConfig);
})();
