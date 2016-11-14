(function () {
    "use strict";
    function initController($scope, $state, ionicDatePicker, $ionicPopover, $ionicModal, $ionicActionSheet, timecardFactory,
        fpmUtilitiesFactory, authenticationFactory) {
        var vm = this;
        var jobCodes = { CLOCK_IN: 5001, CLOCK_OUT: 5002 };
        var toDateString = fpmUtilitiesFactory.toStringDate;
        var statusTypes = {
            NONE: 0,
            SEND_FOR_APPROVAL: 1,
            CANCELLED: 2,
            APPROVED: 3
        };
        var pendingClockIns = [];
        var havingPreRoute = false
        vm.errors = [];
        vm.factory = timecardFactory;
        var alerts = fpmUtilitiesFactory.alerts;
        vm.currentDate = new Date();

        function _updateBindingsForSummaryStatus(details) {
            var anythingPending = _.where(details.timeCardDetails, { finishTime: null });

            if (anythingPending.length > 0) {
                vm.ui.data.allowSendForApproval = false;
                return false;
            }
            if (vm.ui.data.approvalStatus !== statusTypes.NONE) {
                vm.ui.data.allowSendForApproval = false;
                return false;
            }
            vm.ui.data.allowSendForApproval = true;
            return true;
        }

        function _checkIfPastDateSelected() {
            var selected = new Date(vm.ui.data.currentDate.getFullYear(), vm.ui.data.currentDate.getMonth(), vm.ui.data.currentDate.getDate(), 0, 0, 0, 0);
            var current = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0);
            var isPastDate = moment(selected).isBefore(current);
            var isFutureDate = moment(selected).isAfter(current);
            if (moment(selected).isSame(current)) {
                vm.ui.data.addTimeVisibility = vm.ui.data.isClockedIn;
                vm.ui.data.ptoButtonVisibility = !vm.ui.data.isClockedIn;
            }
            vm.ui.data.disableClockInButton = isPastDate;
            if (vm.ui.data.isClockedOut === true) {
                vm.ui.data.disableClockOutButton = isPastDate;
            }
            if (isFutureDate === true) {
                vm.ui.data.disableClockInButton = true;
                vm.ui.data.addTimeVisibility = false;
                vm.ui.data.ptoButtonVisibility = true;
            }
            if (isPastDate === true) {
                vm.ui.data.addTimeVisibility = false;
                vm.ui.data.ptoButtonVisibility = true;
            }
        }

        function _updateTimeCardsArray(details) {
            var sectionCounter = 1;
            var ptoCounter = 1;
            vm.ui.data.timeCards = [];
            if (details.length > 0) {
                angular.forEach(details, function (s, i) {
                    console.log(s);
                    if (s.jobCode !== jobCodes.CLOCK_IN) {
                        if (!s.isPtoType) {
                            s.section = sectionCounter;
                            sectionCounter++;
                        } else {
                            s.pto = ptoCounter;
                            ptoCounter++;
                        }
                    } else {
                        s.section = 0;
                    }
                    if (i === details.length - 1) {
                        vm.ui.data.timeCards = _.reject(details, { jobCode: jobCodes.CLOCK_IN, finishTime: null });
                    }
                });
            }
        }

        function _updateTimeCardBindings(details) {
            console.log("details", details);
            vm.ui.data.timeCards = [];
            vm.ui.data.summary = details.timeCardSummary;
            vm.factory.summary = details.timeCardSummary;
            vm.ui.data.approvalStatus = details.timeCardSummary.approveStatus || 0;
            pendingClockIns = details.pendingClockIns;
            vm.ui.data.currentClockedIn = _.findWhere(details.timeCardDetails, { jobCode: jobCodes.CLOCK_IN, finishTime: null });
            _updateBindingsForSummaryStatus(details);
            if (angular.isDefined(vm.ui.data.currentClockedIn)) {
                var clockIn = vm.ui.data.currentClockedIn;
                vm.ui.data.clockInDateTime = moment(clockIn.startTime);
                vm.ui.data.isClockedIn = true;
                vm.ui.data.isClockedOut = clockIn.finishTime !== null;
                vm.ui.data.addTimeVisibility = !vm.ui.data.isClockedOut;
                vm.ui.data.clockOutDateTime = moment(clockIn.finishTime);
                vm.ui.data.clockedInDate = angular.copy(clockIn);
            }
            _checkIfPastDateSelected();
            _updateTimeCardsArray(details.timeCardDetails);
        }

        function _calculateTotalPayableTime() {
            vm.ui.data.totalTime = "0";
            //JobCode: jobCodes.CLOCK_IN 
            var payables = _.filter(vm.ui.data.timeCards, function (tc) {
                return tc.jobCode === jobCodes.CLOCK_IN && tc.finishTime !== null;
            });
            var nonPayables = _.filter(vm.ui.data.timeCards, function (tc) {
                return tc.jobCode !== jobCodes.CLOCK_IN && tc.isPayable === false && tc.finishTime !== null;
            });
            var totalMins = 0;
            if (payables.length > 0) {
                angular.forEach(payables, function (e, i) {
                    totalMins += moment(e.FinishTime).diff(kendo.parseDate(e.startTime), "minutes");
                });
            }
            if (nonPayables.length > 0) {
                var totalNonPMins = 0;
                angular.forEach(nonPayables, function (e, i) {
                    totalNonPMins += moment(e.finishTime).diff(moment(e.startTime), "minutes");
                    if (i === nonPayables.length - 1) {
                        totalMins = totalMins - totalNonPMins;
                        var hours = Math.floor(totalMins / 60);
                        var mintues = totalMins % 60;
                        vm.ui.data.totalTime = hours + " hrs " + mintues + " min";
                    }
                });
            } else {
                var hours = Math.floor(totalMins / 60);
                var mintues = totalMins % 60;
                vm.ui.data.totalTime = hours + " hrs " + mintues + " min";
            }
        }


        function _getTimeCardByDate() {
            fpmUtilitiesFactory.showLoading().then(function () {

                //_clearClockInData();
                timecardFactory.getTimeCardByDate(toDateString(vm.currentDate)).then(function (response) {
                    console.log("getTimeCardByDate", response);
                    if (response) {
                        _updateTimeCardBindings(response);
                    } else {
                        _checkIfPastDateSelected();
                    }
                }).finally(fpmUtilitiesFactory.hideLoading);
            });
        }

        $ionicPopover.fromTemplateUrl('my-popover.html', {
            scope: $scope
        }).then(function (popover) {
            vm.popover = popover;
        });
        var datePickerConfig = {
            callback: function (val) {
                vm.currentDate = new Date(val);
                _getTimeCardByDate();
            },
            inputDate: vm.currentDate
        };

        function onDatePickerClicked() {
            ionicDatePicker.openDatePicker(datePickerConfig);
        }
        function showPopoverClicked($event) {
            vm.popover.show($event);
        }
        vm.events = {
            onDatePickerClicked: onDatePickerClicked,
            showPopoverClicked: showPopoverClicked
        }

        function _processClockOutUser() {
            var smDt = new Date();
            var clockOutTime = new Date(smDt.getFullYear(), smDt.getMonth(), smDt.getDate(), smDt.getHours(), smDt.getMinutes(), 0, 0);
            console.log(kendo.toString(clockOutTime, "g"));
            var details = {
                startTime: kendo.toString(clockOutTime, "g"),
                jobCode: jobCodes.CLOCK_OUT,
                numFromSummary: vm.ui.data.summary.Num,
                timeCardDate: moment(vm.ui.data.summary.timeCardDate),
                uniqueIdentifier: vm.ui.data.currentClockedIn.uniqueIdentifier
            };
            timecardFactory.clockInOutUser(details).then(function (response) {
                if (response.errors === null) {
                    vm.ui.data.clockOutDateTime = clockOutTime;
                    vm.ui.data.isClockedOut = true;
                    vm.ui.data.isClockedIn = false;
                    vm.ui.data.disableClockOutButton = true;
                    vm.ui.data.addTimeVisibility = false;
                    vm.ui.data.ptoButtonVisibility = true;
                    vm.ui.data.summary = response.timeCardSummary;
                    vm.factory.summary = details.timeCardSummary;
                    var dt = new Date();
                    var cDate = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0);
                    var tcd = new Date(moment(vm.ui.data.summary.timeCardDate));
                    var tcDate = new Date(tcd.getFullYear(), tcd.getMonth(), tcd.getDate(), 0, 0, 0, 0);
                    if (moment(tcDate).isSameOrAfter(cDate)) {
                        vm.ui.data.disableClockInButton = false;
                    }
                    vm.ui.data.approvalStatus = response.timeCardSummary.approveStatus || 0;
                    _updateTimeCardsArray(response.timeCardDetails);
                    _updateBindingsForSummaryStatus(response);
                }
            });
        }

        function showModal() {
            if (vm.ui.data.addEditDetailsModal === null) {
                $ionicModal.fromTemplateUrl("timecardDetailsModal.html", {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    vm.ui.data.addEditDetailsModal = modal;
                    vm.ui.data.addEditDetailsModal.show();
                });
            } else {
                vm.ui.data.addEditDetailsModal.show();
            }
            console.log("vm.ui.data.componentEvents", vm.ui.data.componentEvents);
        }

        vm.ui = {
            errors: [],
            calendar: {
                settings: {
                    theme: "mobiscroll",
                    display: "bottom",
                    swipeDirection: "vertical"
                }
            },
            data: {
                componentEvents: null,
                summary: null,
                currentDate: new Date(),
                isClockedIn: false,
                isClockedOut: false,
                clockInDateTime: new Date(),
                clockOutDateTime: new Date(),
                addTimeVisibility: false,
                clockedInDate: null,
                timeCards: [],
                approvalStatus: 0,
                disableClockInButton: false,
                disableClockOutButton: false,
                currentClockedIn: null,
                allowSendForApproval: false,
                totalTime: "",
                enableForCustomer: false,
                ptoButtonVisibility: false,
                isFromPto: false,
                isInEditMode: false,
                addEditDetailsModal: null,
                currentDetails: null
            },
            events: {
                onAddScheduleCompleted: function (o) {

                },
                onModalCancelClicked: function () {
                    vm.ui.data.isInEditMode = false;
                    vm.ui.data.isFromPto = false;
                    vm.ui.data.currentDetails = null;
                    vm.ui.data.addEditDetailsModal.hide();
                },
                addTimeClick: function (isFromPto) {
                    vm.ui.data.isFromPto = isFromPto;
                    vm.ui.data.isInEditMode = false;
                    showModal();
                    vm.popover.hide();
                    return true;
                },
                onCardActionClicked: function (t) {
                    $ionicActionSheet.show({
                        buttons: [
                            { text: 'Edit' }
                        ],
                        destructiveText: 'Delete',
                        titleText: 'Time Card Options',
                        cancelText: 'Cancel',
                        cancel: function () {
                        },
                        destructiveButtonClicked: function () {
                            if (!t.isUserDefined) {
                                alerts.alert("Invalid Action", "You are not allowed to perform delete");
                            } else {
                                alerts.confirmDelete(function () {
                                    fpmUtilitiesFactory.showLoading().then(function () {
                                        timecardFactory.deleteTimeCardDetails(t.num, t.numFromSummary)
                                            .then(function (response) {
                                                if (response) {
                                                    alerts.alert("Success", "Time Details cleared successfully", function () {
                                                        _updateTimeCardsArray(response.timeCardDetails);
                                                    });
                                                }
                                            }).finally(fpmUtilitiesFactory.hideLoading);
                                    });
                                });
                            }
                            return true;
                        },
                        buttonClicked: function (index) {
                            if (index === 0) {
                                vm.ui.data.currentDetails = t;
                                vm.ui.data.isInEditMode = true;
                                vm.ui.data.isFromPto = false;
                                showModal();
                            }
                            return true;
                        }
                    });
                },
                sendForApproval: function () {

                },
                clockOutClick: function () {
                    var notCheckInDetails = _.where(vm.ui.data.timeCards, { finishTime: null });
                    if (notCheckInDetails.length > 0) {
                        alerts.confirm("Confirmation!", "You have a task pending to check out. \n\n Previously pending tasks will be checked out automattically. \n\n Are you sure?", function () {
                            _processClockOutUser();
                        });
                    } else {
                        alerts.confirm("Confirmation!", "Are you sure?", function () {
                            _processClockOutUser();
                        });
                    }
                },
                clockInClick: function () {
                    var smDt = new Date();
                    var clockInTime = new Date(smDt.getFullYear(), smDt.getMonth(), smDt.getDate(), new Date().getHours(), new Date().getMinutes(), 0, 0);
                    var details = {
                        startTime: fpmUtilitiesFactory.toStringDate(clockInTime),
                        jobCode: jobCodes.CLOCK_IN,
                        numFromSummary: vm.ui.data.summary === null ? 0 : vm.ui.data.summary.Num,
                        timeCardDate: clockInTime
                    };
                    vm.errors = [];
                    timecardFactory.clockInOutUser(details).then(function (response) {
                        if (response.errors === null) {
                            vm.ui.data.clockInDateTime = clockInTime;
                            vm.ui.data.isClockedIn = true;
                            vm.ui.data.addTimeVisibility = true;
                            vm.ui.data.ptoButtonVisibility = false;
                            alerts.alert("Clocked In", "Clocked in successfully", function () {
                                if (havingPreRoute === true) {
                                    $state.go($stateParams.proute);
                                } else {
                                    _updateTimeCardBindings(response);
                                }
                            });
                        } else {
                            vm.errors = response.errors;
                        }
                    });
                }
            }
        };
        var customerNumberList = [{ c: "407805491" }, { c: "1238967820" }];
        function activateController() {
            _getTimeCardByDate();
            var userInfo = authenticationFactory.getLoggedInUserInfo();
            var havingCustomrNumber = _.findWhere(customerNumberList, { c: userInfo.customerNumber });
            vm.ui.data.enableForCustomer = angular.isDefined(havingCustomrNumber);
        }

        $scope.$watch("vm.ui.data.timeCards", function (nw) {
            vm.factory.details = nw;
            if (angular.isDefined(nw)) {
                _calculateTotalPayableTime();
            }
        }, true);

        activateController();
    }
    initController.$inject = ["$scope", "$state", "ionicDatePicker", "$ionicPopover", "$ionicModal",
        "$ionicActionSheet", "timecard-factory", "fpm-utilities-factory", "authenticationFactory"];
    angular.module("fpm").controller("timecard-controller", initController);
})();