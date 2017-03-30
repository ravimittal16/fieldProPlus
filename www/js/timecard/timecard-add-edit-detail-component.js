(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            onCancelClicked: "&",
            onAddCompleted: "&",
        },
        controller: ["$scope", "$timeout", "$q", "$ionicActionSheet", "timecard-factory", "fpm-utilities-factory", "authenticationFactory",
            function ($scope, $timeout, $q, $ionicActionSheet, timecardFactory, fpmUtilitiesFactory, authenticationFactory) {
                var vm = this;
                var alerts = fpmUtilitiesFactory.alerts;
                var isConfirmedBefore = false;
                vm.ui = { summary: angular.copy(timecardFactory.summary), jobCodes: [], workOrders: [], errors: [], isInvalidSave: false, ptoJobCodes: [] };
                vm.dateTimeMode = { timeSpan: "", startTime: new Date(), finishTime: null, isCheckedIn: false, isCheckedOut: false };
                var schema = {
                    num: 0,
                    numFromSummary: 0,
                    timeCardDate: new Date(),
                    startTime: null,
                    finishTime: null,
                    jobCode: 0,
                    notes: "",
                    barcode: 0,
                    isUserDefined: true
                };
                vm.timecardPermissions = {
                    allowPushTime: false,
                    timePickerVisibility: true,
                    isFromAddingPto: false
                };
                vm.entity = null;
                function _addOrUpdateToDatabase() {
                    vm.ui.errors = [];
                    if (vm.entity.finishTime !== null) {
                        var f = kendo.parseDate(vm.entity.finishTime);
                        var dt = kendo.parseDate(vm.entity.timeCardDate);
                        var tcd = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), new Date().getHours(), new Date().getMinutes(), 0, 0);
                        var ft = moment(new Date(f.getFullYear(), f.getMonth(), f.getDate(), f.getHours(), f.getMinutes(), 0, 0));
                        var totalMinutes = moment(ft).diff(kendo.parseDate(vm.entity.startTime), "minutes");
                        if (totalMinutes < 0) {
                            vm.ui.errors.push("Invalid Time");
                            return false;
                        }
                        if (!vm.isFromPto) {
                            if (!vm.editMode && ft.isAfter(tcd)) {
                                vm.ui.errors.push("Cannot be a future time");
                                return false;
                            }
                            if (!vm.editMode && ft.isBefore(tcd)) {
                                vm.ui.errors.push("Finish time must be greater then Start Time");
                                return false;
                            }
                        }
                    }
                    if (vm.entity.jobCode === null || vm.entity.jobCode === 0) {
                        vm.ui.errors.push("Please select Job code before save");
                        return false;
                    }
                    fpmUtilitiesFactory.showLoading().then(function () {
                        var action = vm.isFromPto ? timecardFactory.addPtoDetails : timecardFactory.addNewDetails;
                        action(vm.entity).then(function (response) {
                            isConfirmedBefore = false;
                            if (angular.isArray(response.errors) && response.errors.length > 0) {
                                vm.ui.errors = response.errors;
                            } else {
                                alerts.alert("Time Added", "Time has been " + (vm.editMode ? "updated" : "added"), function () {
                                    if (angular.isFunction(vm.onAddCompleted)) {
                                        vm.onAddCompleted({ o: response });
                                    }
                                });
                            }
                        }).finally(fpmUtilitiesFactory.hideLoading);
                    });
                }
                vm.events = {
                    checkInClick: function () {
                        if (vm.entity.startTime === null) {
                            vm.dateTimeMode.startTime = new Date();
                            vm.entity.startTime = new Date();
                            vm.entity.finishTime = null;
                            vm.dateTimeMode.finishTime = null;
                            _findTimeDiff().then(function (isValid) {
                                if (isValid) {
                                    vm.dateTimeMode.isCheckedIn = true;
                                } else {
                                    vm.ui.errors.push("Invalid Time");
                                }
                            });
                        }
                    },
                    checkOutClick: function () {
                        if (vm.entity.finishTime === null) {
                            vm.dateTimeMode.finishTime = new Date();
                            vm.entity.finishTime = new Date();
                        }
                        _findTimeDiff().then(function (isValid) {
                            if (isValid) {
                                vm.dateTimeMode.isCheckedOut = true;
                            } else {
                                vm.ui.errors.push("Invalid Time");
                            }
                        });
                    },
                    updateButtonClicked: function () {
                        vm.ui.errors = [];
                        vm.ui.isInvalidSave = false;
                        if (vm.entity.startTime === null) {
                            vm.entity.startTime = new Date();
                        }
                        vm.entity.startTime = kendo.toString(vm.entity.startTime, "g");
                        vm.entity.finishTime = kendo.toString(vm.entity.finishTime, "g");
                        if (!vm.editMode) {
                            var allDetails = angular.copy(timecardFactory.details);
                            var notCheckInDetails = _.where(allDetails, { finishTime: null });
                            if (notCheckInDetails.length > 0 && !isConfirmedBefore) {
                                alerts.confirm("Confirmation!", "You have a task pending to check out. \n\n Previously pending tasks will be checked out automattically. \n\n Are you sure?", function (isConfirm) {
                                    isConfirmedBefore = true;
                                    _addOrUpdateToDatabase();
                                });
                            } else {
                                _addOrUpdateToDatabase();
                            }
                            return false;
                        } else {
                            _addOrUpdateToDatabase();
                        }
                        return false;
                    },
                    closeProductEditModal: function () {
                        if (angular.isFunction(vm.onCancelClicked)) {
                            vm.onCancelClicked();
                        }
                    },
                    onDateTimeChaged: onDateTimeChaged,
                    onFinishDateTimeChaged: onFinishDateTimeChaged
                };
                function onDateTimeChaged() {
                    var summary = timecardFactory.summary;
                    var st = vm.dateTimeMode.startTime;
                    var smDt = kendo.parseDate(summary.timeCardDate);
                    vm.entity.startTime = new Date(smDt.getFullYear(), smDt.getMonth(), smDt.getDate(), st.getHours(), st.getMinutes(), 0, 0);
                    _findTimeDiff();
                }

                function onFinishDateTimeChaged() {
                    var summary = timecardFactory.summary;
                    if (vm.entity.startTime === null) {
                        onDateTimeChaged();
                    }
                    var ft = kendo.parseDate(vm.dateTimeMode.finishTime);
                    var smDt = kendo.parseDate(summary.timeCardDate);
                    vm.entity.finishTime = new Date(smDt.getFullYear(), smDt.getMonth(), smDt.getDate(), ft.getHours(), ft.getMinutes(), 0, 0);
                    _findTimeDiff();
                }

                function setInitialStartDateForPto() {
                    if (timecardFactory.summary && timecardFactory.summary.timeCardDate) {
                        var summary = timecardFactory.summary;
                        var td = kendo.parseDate(summary.timeCardDate);
                        var newStartDate = new Date(td.getFullYear(), td.getMonth(), td.getDate(), new Date().getHours(), new Date().getMinutes(), 0);
                        vm.entity.startTime = newStartDate;
                        vm.dateTimeMode.startTime = newStartDate;
                    }
                }

                function initController(eventParams) {
                    //console.log("INIT CONTROLLER");
                    vm.ui.errors = [];
                    vm.details = eventParams.details;
                    vm.editMode = eventParams.editMode;
                    vm.isInEditMode = vm.editMode;
                    var fromPto = eventParams.isFromPto;
                    vm.isFromPto = fromPto;
                    if (vm.editMode && vm.details) {
                        vm.entity = angular.copy(vm.details);
                        vm.entity.startTime = kendo.parseDate(vm.details.startTime);
                        vm.entity.finishTime = kendo.parseDate(vm.details.finishTime);
                        vm.isFromPto = vm.details.isPtoType;
                        vm.dateTimeMode.startTime = null;
                        if (vm.entity.startTime) {
                            vm.dateTimeMode.startTime = vm.entity.startTime;
                            vm.dateTimeMode.isCheckedIn = true;
                        }
                        vm.dateTimeMode.finishTime = null;
                        if (vm.entity.finishTime) {
                            vm.dateTimeMode.finishTime = vm.entity.finishTime;
                            vm.dateTimeMode.isCheckedOut = true;
                        }
                        vm.dateTimeMode.isCheckedOut = vm.entity.finishTime !== null;
                        _findTimeDiff();
                    } else {
                        vm.entity = angular.copy(schema);
                        vm.entity.startTime = new Date();
                        vm.entity.finishTime = null;
                        vm.dateTimeMode.startTime = new Date();
                        vm.dateTimeMode.finishTime = null;
                        vm.dateTimeMode.isCheckedIn = false;
                        vm.dateTimeMode.isCheckedOut = false;
                        vm.dateTimeMode.timeSpan = "";
                        if (fromPto === true) {
                            setInitialStartDateForPto();
                        }
                    }
                    if (timecardFactory.summary) {
                        vm.entity.numFromSummary = timecardFactory.summary.num;
                        vm.entity.timeCardDate = kendo.parseDate(timecardFactory.summary.timeCardDate);
                    }
                    vm.timecardPermissions.isFromAddingPto = fromPto;
                    if (fromPto) {
                        vm.timecardPermissions.timePickerVisibility = fromPto;
                    }
                    //vm.timecardPermissions.timePickerVisibility = fromPto;
                }

                function _findTimeDiff() {
                    var defer = $q.defer();
                    vm.ui.errors = [];
                    vm.ui.isInvalidSave = false;
                    if (Date.parse(vm.entity.startTime) && Date.parse(vm.entity.finishTime)) {
                        var fd = new Date(vm.entity.finishTime);
                        var sd = new Date(vm.entity.startTime);
                        var ft = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate(), fd.getHours(), fd.getMinutes(), 0, 0);
                        var st = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate(), sd.getHours(), sd.getMinutes(), 0, 0);
                        var totalMintues = moment(ft).diff(moment(st), "minutes");
                        var hours = Math.floor(totalMintues / 60);
                        var mintues = totalMintues % 60;
                        var t = $timeout(function () {
                            if (totalMintues > 0) {
                                if (hours > 0) {
                                    vm.dateTimeMode.timeSpan = hours + (hours > 1 ? " Hours " : " Hour ") + mintues + (mintues > 1 ? " Minutes" : " Minute");;
                                } else {
                                    vm.dateTimeMode.timeSpan = mintues + " Minutes";
                                }
                                defer.resolve(true);
                            } else {
                                if (!vm.isInEditMode) {
                                    vm.entity.finishTime = new Date();
                                    vm.ui.isInvalidSave = true;
                                    //vm.ui.errors.push("Invalid Time");
                                    defer.resolve(false);
                                }
                            }
                            $timeout.cancel(t);
                        }, 10);
                    }
                    return defer.promise;
                }

                vm.$onChanges = function () {
                    // //initController();
                    // console.log("CHANGED");
                }
                // initController();

                function _getOrders() {
                    fpmUtilitiesFactory.showLoading().then(function () {
                        timecardFactory.getWorkOrdersList().then(function (response) {
                            vm.ui.workOrders = response;
                        }).finally(_getJobCodes);
                    });
                }

                function _getJobCodes() {
                    fpmUtilitiesFactory.showLoading().then(function () {
                        timecardFactory.getJobCodes().then(function (response) {
                            vm.ui.jobCodes = _.where(response, { isPtoType: false });;
                            vm.ui.ptoJobCodes = _.where(response, { isPtoType: true });
                        }).finally(fpmUtilitiesFactory.hideLoading);
                    });
                }

                vm.$onInit = function () {
                    vm.userInfo = authenticationFactory.getLoggedInUserInfo();
                    if (vm.userInfo) {
                        vm.timecardPermissions.allowPushTime = vm.userInfo.allowPushTime;
                        vm.timecardPermissions.timePickerVisibility = vm.userInfo.allowPushTime;
                    }
                    _getOrders();
                }
                $scope.$on("timecard:addEditDetailsModal:open", function ($event, params) {
                    initController(params);
                    // vm.entity = angular.copy(schema);
                    // vm.dateTimeMode.startTime = null;
                    // vm.dateTimeMode.finishTime = null;
                    // vm.dateTimeMode.timeSpan = "";
                    // vm.dateTimeMode.isCheckedIn = false;
                    // vm.dateTimeMode.isCheckedOut = false;
                    // vm.ui.errors = [];
                    // vm.timecardPermissions.isFromAddingPto = params.isFromPto;
                    // //vm.isFromPto = params.isFromPto;
                    // if (vm.timecardPermissions.isFromAddingPto === true) {
                    //     vm.timecardPermissions.timePickerVisibility = true;
                    // }
                })
            }],
        controllerAs: "vm",
        templateUrl: "js/timecard/timecard-add-edit-detail-component.template.html"
    };
    angular.module("fpm").component("addEditDetailsComponent", componentConfig);
})();