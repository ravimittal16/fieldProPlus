(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            onCancelClicked: "&",
            onAddCompleted: "&",
            details: "<",
            isFromPto: "<",
            editMode: "<"
        },
        controller: ["$scope", "$timeout", "$ionicActionSheet", "timecard-factory", "fpm-utilities-factory", "authenticationFactory",
            function ($scope, $timeout, $ionicActionSheet, timecardFactory, fpmUtilitiesFactory, authenticationFactory) {
                var vm = this;
                var alerts = fpmUtilitiesFactory.alerts;
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
                vm.events = {
                    onCardActionClicked: function () {
                        $ionicActionSheet.show({
                            buttons: [
                                { text: 'Check In' }, { text: "Check Out" }
                            ],
                            titleText: 'Time card',
                            cancelText: 'Cancel',
                            cancel: function () {

                            },
                            buttonClicked: function (index) {
                                if (index === 0) {
                                    if (vm.entity.startTime === null) {
                                        vm.dateTimeMode.startTime = new Date();
                                        vm.entity.startTime = new Date();
                                        vm.entity.finishTime = null;
                                        vm.dateTimeMode.finishTime = null;
                                    }
                                    vm.dateTimeMode.isCheckedIn = true;
                                    _findTimeDiff();
                                }
                                if (index === 1) {
                                    if (vm.entity.finishTime === null) {
                                        vm.dateTimeMode.finishTime = new Date();
                                        vm.entity.finishTime = new Date();
                                    }
                                    vm.dateTimeMode.isCheckedOut = true;
                                    _findTimeDiff();
                                }
                                return true;
                            }
                        });
                    },
                    updateButtonClicked: function () {
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
                            }
                        }
                        if (vm.entity.jobCode === null || vm.entity.jobCode === 0) {
                            vm.ui.errors.push("Please select Job code before save");
                            return false;
                        }
                        console.log(vm.entity);
                        //return false;
                        fpmUtilitiesFactory.showLoading().then(function () {
                            var action = vm.isFromPto ? timecardFactory.addPtoDetails : timecardFactory.addNewDetails;
                            action(vm.entity).then(function (response) {
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
                    },
                    closeProductEditModal: function () {
                        if (angular.isFunction(vm.onCancelClicked)) {
                            vm.onCancelClicked();
                        }
                    },
                    onDateTimeChaged: onDateTimeChaged,
                    onFinishDateTimeChaged: onFinishDateTimeChaged,
                    initController: function () {
                        console.log("INIT CONTROLLER");
                    }
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
                    var ft = vm.dateTimeMode.finishTime;
                    var smDt = kendo.parseDate(summary.timeCardDate);
                    vm.entity.finishTime = new Date(smDt.getFullYear(), smDt.getMonth(), smDt.getDate(), ft.getHours(), ft.getMinutes(), 0, 0);
                    _findTimeDiff();
                }

                function setInitialStartDateForPto() {
                    var summary = timecardFactory.summary;
                    if (summary && summary.timeCardDate) {
                        var td = kendo.parseDate(summary.timeCardDate);
                        var newStartDate = new Date(td.getFullYear(), td.getMonth(), td.getDate(), new Date().getHours(), new Date().getMinutes(), 0);
                        vm.entity.startTime = newStartDate;
                        vm.dateTimeMode.startTime = newStartDate;
                    }
                }

                function initController() {
                    if (vm.editMode && vm.details) {
                        vm.entity = angular.copy(vm.details);
                        vm.entity.startTime = kendo.parseDate(vm.details.startTime);
                        vm.entity.finishTime = kendo.parseDate(vm.details.finishTime);
                        if (vm.entity.startTime) {
                            vm.dateTimeMode.startTime = kendo.parseDate(vm.entity.startTime);
                            vm.dateTimeMode.isCheckedIn = true;
                        }
                        if (vm.entity.finishTime) {
                            vm.dateTimeMode.finishTime = kendo.parseDate(vm.entity.finishTime);
                            vm.dateTimeMode.isCheckedOut = true;
                        }
                        vm.dateTimeMode.isCheckedOut = vm.entity.finishTime !== null;
                        _findTimeDiff();
                    } else {
                        vm.entity = angular.copy(schema);
                        vm.entity.startTime = new Date();
                        vm.entity.finishTime = new Date();
                        if (vm.isFromPto === true) {
                            setInitialStartDateForPto();
                        }
                    }
                    if (timecardFactory.summary) {
                        vm.entity.numFromSummary = timecardFactory.summary.num;
                        vm.entity.timeCardDate = new Date(moment(timecardFactory.summary.timeCardDate));
                    }
                    vm.timecardPermissions.isFromAddingPto = vm.isFromPto;
                }

                function _findTimeDiff() {
                    vm.ui.errors = [];
                    vm.ui.isInvalidSave = false;
                    console.log("Date.parse(vm.entity.finishTime)", Date.parse(vm.entity.finishTime));
                    if (Date.parse(vm.entity.startTime) && Date.parse(vm.entity.finishTime)) {
                        var fd = new Date(vm.entity.finishTime);
                        var sd = new Date(vm.entity.startTime);
                        console.log("new Date(vm.entity.finishTime", new Date(vm.entity.finishTime));
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
                            } else {
                                if (!vm.isInEditMode) {
                                    vm.entity.finishTime = new Date();
                                    vm.ui.isInvalidSave = true;
                                    vm.ui.errors.push("Invalid Time");
                                }
                            }
                            $timeout.cancel(t);
                        }, 10);
                    }
                    return "";
                }

                vm.$onChanges = function () {
                    initController();
                    console.log("INIT CONTROLLER");
                }
                initController();

                function _getOrders() {
                    timecardFactory.getWorkOrdersList().then(function (response) {
                        vm.ui.workOrders = response;
                    }).finally(_getJobCodes);
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
                    vm.timecardPermissions.isFromAddingPto = vm.isFromPto;
                    if (vm.timecardPermissions.isFromAddingPto === true) {
                        vm.timecardPermissions.timePickerVisibility = true;
                    }
                    _getOrders();
                }
            }],
        controllerAs: "vm",
        templateUrl: "js/timecard/timecard-add-edit-detail-component.template.html"
    };
    angular.module("fpm").component("addEditDetailsComponent", componentConfig);
})();