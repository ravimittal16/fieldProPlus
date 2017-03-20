(function () {
    "use strict";

    function initController($scope, $state, $q, $timeout, $window, $stateParams, $ionicActionSheet, $ionicNavBarDelegate, $ionicLoading,
        $ionicPopup, $ionicModal, workOrderFactory, fpmUtilities, sharedDataFactory, authenticationFactory, timecardFactory) {
        var vm = this;

        vm.barcode = $stateParams.barCode;
        var platforms = fpmUtilities.device.platforms;
        var platform = fpmUtilities.device.getPlatformInfo();
        vm.taxCheckboxVisibility = true;
        var alerts = fpmUtilities.alerts;
        var jobStatus = {
            AcceptJob: 0, InRoute: 1, CheckIn: 2, CheckOut: 3
        };
        var jobCodes = {
            CLOCK_IN: 5001, CLOCK_OUT: 5002
        };
        vm.invoiceOpen = true;
        vm.uiSettings = {
            isTimeCardModuleEnabled: false,
            milageTrackingEnabled: false,
            orderBelongToCurrentUser: false,
            timerEnabled: false,
            woData: null,
            showEquipmentTabControl: false,
            billingOption: 0,
            isRouteTimeOptionChecked: false,
            enableMarkup: false
        };

        vm.errors = [];
        vm.gettingBarcodeDetails = true;
        function getBarcodeDetails() {
            vm.gettingBarcodeDetails = true;
            $ionicLoading.show({
                template: "loading work order..."
            }).then(function () {
                workOrderFactory.getBarcodeDetails(vm.barcode).then(function (response) {
                    vm.gettingBarcodeDetails = false;
                    vm.barCodeData = response;
                    vm.uiSettings.woData = angular.copy(response);
                    vm.taxCheckboxVisibility = (vm.barCodeData.taxRate || 0) > 0;
                    if (angular.isArray(response.schedules) && response.schedules.length > 0) {
                        vm.schedule = angular.copy(_.findWhere(response.schedules, { num: parseInt($stateParams.technicianNum, 10) }));
                        if (angular.isDefined(vm.schedule)) {
                            if (vm.schedule.actualStartDateTime) {
                                vm.schedule.actualStartDateTime = kendo.parseDate(vm.schedule.actualStartDateTime);
                                vm.schedule.actualStartDateTimeString = kendo.toString(kendo.parseDate(vm.schedule.actualStartDateTime), "g");
                            }
                            if (vm.schedule.actualFinishDateTime) {
                                vm.schedule.actualFinishDateTime = kendo.parseDate(vm.schedule.actualFinishDateTime);
                                vm.schedule.actualFinishDateTimeString = kendo.toString(kendo.parseDate(vm.schedule.actualFinishDateTime), "g");
                            }
                            findTimeDiff(vm.schedule.actualStartDateTime, vm.schedule.actualFinishDateTime);
                            if (vm.uiSettings.billingOption === 0) {
                                vm.schedule.inRouteStartTime = kendo.parseDate(vm.schedule.inRouteStartTime);
                                vm.schedule.inRouteEndTime = kendo.parseDate(vm.schedule.inRouteEndTime);
                            }
                            if (vm.uiSettings.billingOption === 0 && vm.uiSettings.isRouteTimeOptionChecked) {
                                findTimeDiff(vm.schedule.inRouteStartTime, vm.schedule.inRouteEndTime, true);
                            }
                            vm.uiSettings.orderBelongToCurrentUser = vm.schedule.technicianNum === vm.userId;
                            $ionicLoading.hide();
                            calculateTotals();
                        } else {
                            $ionicLoading.hide();
                            calculateTotals();
                        }
                    } else {
                        $ionicLoading.hide();
                        calculateTotals();
                    }
                }, function (data) {
                    alerts.alert("Oops", "ERROR WHILE GETTING WORK ORDER INFORMATION..", $ionicLoading.hide);
                });
            });
        }


        //CURRENT SCHEDULE CARD
        //============================================================================================
        var findTimeDiffTimer = null;
        function findTimeDiff(startDate, endDate, forInRoute) {
            var defer = $q.defer();
            if (Date.parse(startDate) && Date.parse(endDate)) {
                var fd = new Date(endDate);
                var sd = new Date(startDate);
                var ft = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate(), fd.getHours(), fd.getMinutes(), 0, 0);
                var st = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate(), sd.getHours(), sd.getMinutes(), 0, 0);
                var totalMintues = moment(ft).diff(moment(st), "minutes");
                var mins = totalMintues % 60;
                var hours = Math.floor(totalMintues / 60);
                findTimeDiffTimer = $timeout(function () {
                    if (forInRoute) {
                        if (hours === 0) {
                            vm.scheduleTimeSpan.inRouteTimeSpan = mins + " Minutes";
                        } else {
                            vm.scheduleTimeSpan.inRouteTimeSpan = hours + " Hours " + mins + " Minutes";
                        }
                    } else {
                        if (hours === 0) {
                            vm.scheduleTimeSpan.timeSpan = mins + " Minutes";
                        } else {
                            vm.scheduleTimeSpan.timeSpan = hours + " Hours " + mins + " Minutes";
                        }
                    }
                }, 50);
                defer.resolve(totalMintues);
            } else {
                defer.resolve(0);
            }
            return defer.promise;
        }

        function addMinutes(date, minutes) {
            return new Date(date.getTime() + minutes * 60000);
        }

        var onInRouteTimespanChangedTimer = null;

        function onInRouteTimespanChanged(s, e) {
            var timeSpanSelected = e.getVal();
            var seconds = Math.floor(timeSpanSelected / 1000);
            var minutesToAdd = Math.floor(seconds / 60);
            onInRouteTimespanChangedTimer = $timeout(function () {
                var start = angular.copy(vm.schedule.inRouteStartTime);
                var startDate;
                if (start == null) {
                    startDate = new Date();
                    vm.schedule.inRouteStartTime = new Date();
                } else {
                    startDate = new Date(start);
                }
                var finalDate = addMinutes(startDate, minutesToAdd);
                vm.schedule.inRouteEndTime = kendo.parseDate(finalDate);
                updateSchedule(false, false);
            }, 50);
        }

        function onInRouteTImeChanged() {
            findTimeDiff(vm.schedule.inRouteStartTime, vm.schedule.inRouteEndTime, true);
            updateSchedule(false, false);
        }

        var onTimespanSeletionChangedTimer = null;


        vm.scheduleTimeSpan = {
            timeSpan: "",
            inRouteTimeSpan: "",
            onInRouteTimespanChanged: onInRouteTimespanChanged,
            onInRouteTImeChanged: onInRouteTImeChanged,
            onTimespanSeletionChanged: function (s, e) {
                var timeSpanSelected = e.getVal();
                var seconds = Math.floor(timeSpanSelected / 1000); //ignore any left over units smaller than a second
                var minutesToAdd = Math.floor(seconds / 60);
                onTimespanSeletionChangedTimer = $timeout(function () {
                    var start = angular.copy(vm.schedule.actualStartDateTime);
                    var startDate;
                    if (start == null) {
                        startDate = new Date();
                        vm.schedule.actualStartDateTime = new Date();
                    } else {
                        startDate = new Date(start);
                    }
                    var finalDate = addMinutes(startDate, minutesToAdd);
                    vm.schedule.actualFinishDateTime = kendo.parseDate(finalDate);
                    if (!vm.schedule.approve) {
                        updateSchduleTotalTime();
                    }
                }, 50);
            },
            onStartDateTimeChaged: function () {
                if (vm.uiSettings.billingOption === 0 && vm.schedule) {
                    if (vm.schedule.actualStartDateTime && vm.schedule.actualFinishDateTime) {
                        if (new Date(vm.schedule.actualStartDateTime) > new Date(vm.schedule.actualFinishDateTime)) {
                            alerts.alert("Warning", "Start time cannot be greater than finish time.");
                        } else {
                            findTimeDiff(vm.schedule.actualStartDateTime, vm.schedule.actualFinishDateTime).then(function (totalMins) {
                                if (!vm.schedule.approve) {
                                    updateSchduleTotalTime();
                                }
                            });
                        }
                    }
                } else {
                    updateSchedule(false, false);
                }
            },
            onEndDateTimeChanged: function () {
                if (vm.uiSettings.billingOption === 0 && vm.schedule) {
                    if (vm.schedule && vm.schedule.actualStartDateTime && vm.schedule.actualFinishDateTime) {
                        if (new Date(vm.schedule.actualStartDateTime) > new Date(vm.schedule.actualFinishDateTime)) {
                            alerts.alert("Warning", "Finish time cannot be less than start time");
                        } else {
                            findTimeDiff(vm.schedule.actualStartDateTime, vm.schedule.actualFinishDateTime).then(function (totalMins) {
                                if (!vm.schedule.approve) {
                                    updateSchduleTotalTime();
                                }
                            });
                        }
                    }
                } else {
                    updateSchedule(false, false);
                }
            },
            clearAllDateTimeSelection: function () { }
        };

        function checkAuthorizationIfServiceProvider(co, cb, fromAddSchedule) {
            if (vm.schedule) {
                // console.log("vm.user", vm.user);
                var havingGroupsAssigned = vm.user.havingGroupsAssigned;
                if (vm.isServiceProvider === false) {
                    return true;
                }
                var isBeongToCurrentUser = vm.schedule.technicianNum === vm.user.userEmail;
                if (havingGroupsAssigned === true && fromAddSchedule && fromAddSchedule === true) {
                    var checkifBelongToAssinedUser = _.findWhere(vm.serviceProviders, {
                        UserId: vm.schedule.TechnicianNum
                    });
                    if (angular.isDefined(checkifBelongToAssinedUser)) {
                        return true;
                    }
                }
                if (vm.isServiceProvider === true && isBeongToCurrentUser === false) {
                    alerts.alert("Oops!", "you are not authorized to perform this action", function () {
                        if (angular.isFunction(cb) && co) {
                            cb(co);
                        }
                    });
                    return false;
                }
                return true;
            }
            return false;
        }

        function clearAllDateTimeSelection(clearAll) {
            if (checkAuthorizationIfServiceProvider(null, null, false)) {
                if (clearAll === true) {
                    vm.schedule.actualStartDateTime = null;
                }
                vm.schedule.actualFinishDateTime = null;
                vm.scheduleTimeSpan.timeSpan = "";
                if (!vm.schedule.approve) {
                    updateSchduleTotalTime();
                }
            }
        }

        function updateSchduleTotalTime() {
            var sch = angular.copy(vm.schedule);
            sch.actualStartDateTime = kendo.toString(vm.schedule.actualStartDateTime, "g");
            sch.actualFinishDateTime = kendo.toString(vm.schedule.actualFinishDateTime, "g");
            workOrderFactory.updateSchduleTotalTime(sch).then(function (response) {
                if (response) {
                    vm.barCodeData.schedules = response.schedules;
                    vm.barCodeData.invoice = response.invoice;
                    calculateTotals();
                }
            });
        }

        function pushToTimecard() {
            var model = {
                num: 0,
                numFromSummary: 0,
                timeCardDate: fpmUtilities.toStringDate(vm.schedule.actualStartDateTime),
                startTime: fpmUtilities.toStringDate(vm.schedule.actualStartDateTime),
                finishTime: fpmUtilities.toStringDate(vm.schedule.actualFinishDateTime),
                jobCode: 0,
                notes: "",
                barcode: vm.barcode,
                isUserDefined: true,
                scheduleId: vm.schedule.num
            };
            if (vm.schedule.actualStartDateTime) {
                timecardFactory.pushCheckInOutTimes(model).then(function (response) {
                    if (angular.isArray(response) && response.length > 0) {
                        alerts.alert("Warning", response[0]);
                    } else {
                        alerts.alert("Success", "Details successfully pushed to timecard");
                    }
                });
            } else {
                alerts.alert("Warning", "Please select Check In date and time");
            }
        }
        //================================================================================================
        vm.user = authenticationFactory.getLoggedInUserInfo();
        function activateController() {
            isMapLoaded = false;
            vm.uiSettings.isTimeCardModuleEnabled = vm.user.timeCard && vm.user.allowPushTime;
            vm.isServiceProvider = !vm.user.isAdminstrator;
            vm.showPrice = vm.user.showPrice;
            sharedDataFactory.getIniitialData().then(function (response) {
                if (response) {
                    vm.uiSettings.milageTrackingEnabled = response.customerNumberEntity.milageTrackingEnabled || false;
                    vm.uiSettings.timerEnabled = response.customerNumberEntity.workOrderTimerEnabled || false;
                    vm.uiSettings.showEquipmentTabControl = response.customerNumberEntity.equipmentTrackingOn || false;
                    vm.uiSettings.enableMarkup = response.customerNumberEntity.enableMarkupForWorkOrders || false;
                    vm.enableMarkup = vm.uiSettings.enableMarkup;
                    if (response.customerNumberEntity.billingOption) {
                        vm.uiSettings.billingOption = response.customerNumberEntity.billingOption;
                    }
                    if (vm.uiSettings.billingOption === 0) {
                        vm.uiSettings.isRouteTimeOptionChecked = response.customerNumberEntity.isRouteTimeOptionChecked;
                    }

                    vm.scheduleStatus = response.secondaryOrderStatus;
                    vm.serviceProviders = response.serviceProviders;
                    vm.vehicles = response.vehicles;
                }
            }).finally(_getTodaysTimeCardEntries);
        }


        function calculateTotals() {
            vm.totals = {
                subtotal: 0,
                totalqty: 0,
                totalcost: 0,
                totaltax: 0
            };
            if (vm.barCodeData.invoice && vm.barCodeData.invoice.length > 0) {
                var taxRate = vm.barCodeData.taxRate || 0;
                angular.forEach(vm.barCodeData.invoice, function (pro) {
                    if (pro.price && pro.qty) {
                        var totalPrice = 0;
                        if (!angular.isDefined(pro.newPriceCalculated)) {
                            pro.newPriceCalculated = false;
                        }
                        if (angular.isNumber(parseFloat(pro.price)) && angular.isNumber(parseInt(pro.qty, 10))) {
                            if (pro.markup > 0) {
                                var newPrice = pro.newPriceCalculated ? pro.price : (parseFloat(pro.price) + (parseFloat(((pro.markup || 0) / 100) * (pro.price))));
                                pro.price = newPrice;
                                pro.newPriceCalculated = true;
                                totalPrice = newPrice * pro.qty;
                            } else {
                                totalPrice = pro.price * pro.qty;
                            }
                            pro.totalPrice = totalPrice;
                            var taxAmt = parseFloat(parseFloat(taxRate) > 0 ? parseFloat((taxRate / 100) * (totalPrice)) : 0);
                            vm.totals.subtotal += parseFloat(totalPrice);
                            vm.totals.totalqty += parseInt(pro.qty, 10);
                            if ((pro.taxable || false) === true) {
                                vm.totals.totaltax += parseFloat(taxAmt);
                            }
                        }
                    }
                });
            }
        }

        function updateOrder() {
            if (checkAuthorizationIfServiceProvider(null, null, false)) {
                workOrderFactory.updateWorkOrderMobile({
                    barcodeAssay: vm.barCodeData.barcodeDetails,
                    fromMobile: true
                }).then(function (response) {
                    if (response && angular.isArray(response) && response.length > 0) {
                        vm.errors = response;
                    }
                });
            }
        }

        function updateSchedule(showSuccessAlert, showLoading) {
            var sch = angular.copy(vm.schedule);
            if (vm.schedule.actualStartDateTime) {
                sch.actualStartDateTime = kendo.toString(vm.schedule.actualStartDateTime, "g");
            }
            if (vm.schedule.actualFinishDateTime) {
                sch.actualFinishDateTime = kendo.toString(vm.schedule.actualFinishDateTime, "g");
            }
            if (vm.schedule.inRouteStartTime) {
                sch.inRouteStartTime = kendo.toString(vm.schedule.inRouteStartTime, "g");
            }
            if (vm.schedule.inRouteEndTime) {
                sch.inRouteEndTime = kendo.toString(vm.schedule.inRouteEndTime, "g");
            }
            if (showLoading === true) {
                fpmUtilities.showLoading().then(function () {
                    workOrderFactory.updateSchedule(sch).then(function () {
                        if (showSuccessAlert) {
                            alerts.alert("Success", "Schedule information updated successfully");
                        }
                    }).then(fpmUtilities.hideLoading);
                });
            } else {
                workOrderFactory.updateSchedule(sch).then(function () {
                    if (showSuccessAlert) {
                        alerts.alert("Success", "Schedule information updated successfully");
                    }
                });
            }
        }

        var actions = [{
            text: '<span class="text-assertive">Clear All</span>'
        }, {
            text: '<span class="text-assertive">Clear Checkout Time</span>'
        }, {
            text: 'Update Schedule'
        }];

        function restoreSchedule(o) {
            if (vm.uiSettings.woData) {
                var s = _.findWhere(vm.uiSettings.woData.schedules, { num: o.num });
                if (angular.isDefined(s)) {
                    for (var prop in s) {
                        if (o.hasOwnProperty(prop)) {
                            o[prop] = s[prop];
                        }
                    }
                }
            }
        }

        function restoreInvoice(o) {
            if (vm.uiSettings.woData) {
                var s = _.findWhere(vm.uiSettings.woData.invoice, { num: o.num });
                if (angular.isDefined(s)) {
                    for (var prop in s) {
                        if (o.hasOwnProperty(prop)) {
                            o[prop] = s[prop];
                        }
                    }
                }
            }
        }

        function processCheckIn() {
            fpmUtilities.showLoading().then(function () {
                vm.schedule.actualStartDateTime = new Date();
                vm.schedule.actualFinishDateTime = null;
                vm.scheduleTimeSpan.onStartDateTimeChaged();
                workOrderFactory.updateJobStatus({
                    scheduleButton: jobStatus.CheckIn, scheduleNum: vm.schedule.num,
                    actualStartTime: fpmUtilities.toStringDate(vm.schedule.actualStartDateTime), barcode: vm.barcode,
                    timerStartAt: fpmUtilities.toStringDate(new Date())
                }).then(function () {
                    vm.schedule.checkInStatus = true;
                }).finally(fpmUtilities.hideLoading);
            });
        }

        function openProductSearchModal() {
            if (vm.productSearchModal) {
                vm.productSearchModal.show();
            } else {
                fpmUtilities.getModal("productSearchModal.html", $scope).then(function (modal) {
                    vm.productSearchModal = modal;
                    vm.productSearchModal.show();
                });
            }
        }

        function openEditProductModal() {
            if (vm.productModal) {
                vm.productModal.show();
            } else {
                fpmUtilities.getModal("editProductModal.html", $scope).then(function (modal) {
                    vm.productModal = modal;
                    vm.productModal.show();
                });
            }
        }

        var workOrderMapModal = null;
        vm.scheduleAddModal = null;
        var workOrderMapTimer = null;
        vm.map = null;
        var isMapLoaded = false;
        function loadWorkOrderMap() {
            var goourl = "http://maps.google.com/maps?saddr=Current+Location&daddr=";
            var d = vm.barCodeData.barcodeDetails;
            if (d.shipStreet) {
                goourl += d.shipStreet.replace("::", " ");
            }
            goourl += " " + d.shipCity + ", " + d.shipState + " " + d.shipZIP;
            $window.open(goourl, '_blank', 'location=yes');
        }
        vm.tabs = {
            desc: {
                events: {
                    reloadWorkResolution: function () {
                        if (checkAuthorizationIfServiceProvider()) {
                            fpmUtilities.showLoading().then(function () {
                                var id = vm.barCodeData.barcodeDetails.id;
                                workOrderFactory.getWorkOrderResolution(id).then(function (response) {
                                    if (response) {
                                        vm.barCodeData.barcodeDetails.comment_2 = response.comment_2;
                                        vm.barCodeData.barcodeDetails.comment_4 = response.comment_4;
                                    }
                                }).finally(fpmUtilities.hideLoading)
                            })
                        }
                    },
                    refreshOnPullDown: function () {
                        _getTodaysTimeCardEntries();
                        $scope.$broadcast("scroll.refreshComplete");
                    },
                    closeWorkOrderMapModal: function () {
                        isMapLoaded = false;
                        if (workOrderMapModal) {
                            workOrderMapModal.hide();
                        }
                    },
                    onAddressTapped: function () {
                        // fpmUtilities.getModal("workOrderMap.html", $scope).then(function (modal) {
                        //     workOrderMapModal = modal;
                        //     workOrderMapModal.show().then(function () { 
                        //         loadWorkOrderMap();
                        //     });
                        // });
                        loadWorkOrderMap();
                    },
                    onDescriptionOrResolutionChanged: function () {
                        updateOrder();
                    }
                }
            },
            sch: {
                events: {
                    workCompleteChanged: function () {
                        if (checkAuthorizationIfServiceProvider(vm.schedule, restoreSchedule, false)) {
                            updateSchedule(true, true);
                        }
                    },
                    onCustomScheduleChanged: function (e) {
                        if (!vm.schedule.approve) {
                            workOrderFactory.updateCustomScheduleData(e);
                        }
                    },
                    pushToTimecard: function () {
                        pushToTimecard();
                    },
                    onAddScheduleCompleted: function (o) {
                        if (o) {
                            vm.scheduleAddModal.hide();
                            alerts.alert("Success", "Schedule added successfully", function () {
                                $timeout(function () {
                                    //vm.user = authenticationFactory.getLoggedInUserInfo();
                                    vm.barCodeData.schedules = o.schedules;
                                    vm.barCodeData.invoice = o.invoice;
                                    calculateTotals();
                                }, 50);
                            });
                        }
                    },
                    onModalCancelClicked: function () {
                        vm.scheduleAddModal.hide();
                    },
                    updateMilage: function () {
                        if (vm.schedule.startMiles && vm.schedule.endMiles) {
                            vm.schedule.totalMiles = parseFloat(parseFloat(vm.schedule.endMiles) - parseFloat(vm.schedule.startMiles)).toFixed(2);
                            updateSchedule(false, false);
                        }
                    },
                    onTripnoteChanged: function () {
                        updateSchedule(false, false);
                    },
                    updateSchedule: function () {
                        updateSchedule(true, true);
                    },
                    onListScheduleItemTap: function (sch) {
                        if (sch.num !== vm.schedule.num) {
                            alerts.confirm("Confirmation", "Are you sure to load this schedule", function () {
                                $state.go("app.editOrder", { barCode: vm.barcode, technicianNum: sch.num, src: "main" });
                            });
                        }
                    },
                    onSchedulesListButtonClicked: function () {
                        if (vm.scheduleAddModal === null) {
                            fpmUtilities.getModal("addScheduleModal.html", $scope).then(function (modal) {
                                vm.scheduleAddModal = modal;
                                vm.scheduleAddModal.show();
                            });
                        } else {
                            vm.scheduleAddModal.show();
                        }
                    },
                    checkIn: function () {
                        if (vm.schedule.approve === true || vm.schedule.checkInStatus === true) {
                            alerts.alert("Alert", "Not allowed to checkin");
                        } else {
                            if (checkAuthorizationIfServiceProvider(null, null, true)) {
                                if (vm.user.timeCard === true) {
                                    var runningClockIn = _.where(timeCardInfo.currentDetails, {
                                        jobCode: jobCodes.CLOCK_IN,
                                        finishTime: null
                                    });
                                    var checkins = _.reject(timeCardInfo.currentDetails, {
                                        jobCode: jobCodes.CLOCK_IN
                                    });
                                    if (runningClockIn.length === 0) {
                                        alerts.confirm("Confirmation!", "You have not clocked in yet. You will be clocked in automattically \n\n Are you sure?", function () {
                                            processCheckIn();
                                        }, function () {
                                            //UNBLOCKUI
                                        });
                                    } else {
                                        if (checkins.length > 0) {
                                            var runningCheckIn = _.where(checkins, {
                                                finishTime: null,
                                                jobCodeName: "On Job"
                                            });
                                            if (runningCheckIn.length > 0) {
                                                alerts.alert("Warning!", "You have not checked out for previous task.", function () {
                                                    //UNBLOCKUI
                                                });
                                            } else {
                                                processCheckIn();
                                            }
                                        } else {
                                            processCheckIn();
                                        }
                                    }
                                } else {
                                    processCheckIn();
                                }
                            }
                            return false;
                        }
                    },
                    checkOut: function () {
                        if (vm.schedule.approve === true || vm.schedule.checkOutStatus === true) {
                            alerts.alert("Alert", "Not allowed to checkout");
                        } else {
                            if (checkAuthorizationIfServiceProvider(null, null, false)) {
                                if (vm.schedule.actualStartDateTime === null) {
                                    alerts.alert("Warning", "Please check in first");
                                    return false;
                                }
                                vm.schedule.actualFinishDateTime = new Date();
                                vm.scheduleTimeSpan.onEndDateTimeChanged();
                                workOrderFactory.updateJobStatus({
                                    scheduleButton: jobStatus.CheckOut, scheduleNum: vm.schedule.num,
                                    actualEndTime: fpmUtilities.toStringDate(vm.schedule.actualFinishDateTime), Barcode: vm.barcode
                                }).then(function () {
                                    vm.schedule.checkOutStatus = true;
                                });
                            }
                        }
                    },
                    clearAllDateTimeSelection: function (clearAll) {
                        clearAllDateTimeSelection(clearAll);
                    },
                    onScheduleActionButtonClicked: function () {
                        var defaultActions = angular.copy(actions);
                        // if (vm.user.allowPushTime) {
                        //     defaultActions.push({
                        //         text: '<b>Push to Timecard</b>'
                        //     });
                        // }
                        $ionicActionSheet.show({
                            buttons: defaultActions,
                            titleText: 'Current Schedule',
                            cancelText: 'Cancel',
                            cancel: function () {
                                // add cancel code..
                            },
                            buttonClicked: function (index) {
                                if (index === 0) {
                                    clearAllDateTimeSelection(true);
                                }
                                if (index === 1) {
                                    clearAllDateTimeSelection(false);
                                }
                                if (index === 2) {
                                    updateSchedule(true, true);
                                }
                                if (index === 3) {
                                    pushToTimecard();
                                }
                                return true;
                            }
                        });
                    }
                }
            },
            smry: {
                events: {
                    onTaxCheckboaxChanged: function (i) {
                        if (checkAuthorizationIfServiceProvider(i, restoreInvoice)) {
                            calculateTotals();
                            workOrderFactory.updateOrderProduct(i);
                        }
                    }
                }
            },
            prod: {
                events: {
                    onProdcutActionButtonClicked: function () {
                        openProductSearchModal();
                    },
                    closeProductEditModal: function () {
                        vm.productModal.hide();
                    },
                    openProductSearchModal: function () {

                    },
                    onEditProductClicked: function (product) {
                        vm.currentProduct = angular.copy(product);
                        openEditProductModal();
                    },
                    onDeleteProductClicked: function (product) {
                        alerts.confirmDelete(function () {
                            workOrderFactory.deleteProduct(vm.barcode, product.num).then(function (response) {
                                if (response) {
                                    vm.barCodeData.products = response.products;
                                    vm.barCodeData.invoice = response.invoice;
                                    calculateTotals();
                                }
                            });
                        });
                    }
                }
            }
        }
        var timeCardInfo = {
            currentDetails: []
        };

        function _getTodaysTimeCardEntries() {
            if (vm.user.timeCard === true) {
                var cdt = new Date();
                var dt = fpmUtilities.toStringDate(new Date(cdt.getFullYear(), cdt.getMonth(), cdt.getDate(), 0, 0, 0, 0));
                timecardFactory.getTimeCardByDate(dt).then(function (response) {
                    if (response) {
                        timeCardInfo.currentDetails = response.timeCardDetails;
                    }
                });
            }
        }


        $scope.$on("$fpm:closeEditProductModal", function () {
            if (vm.productModal) {
                vm.productModal.hide();
            }
        });

        $scope.$on("$fpm:closeProductSearchModal", function ($event, args) {
            if (vm.productSearchModal) {
                if (args && args.fromProductAdd === true) {
                    workOrderFactory.getBarcodeInvoiceAndProductDetails(vm.barcode).then(function (response) {
                        vm.barCodeData.products = response.products;
                        vm.barCodeData.invoice = response.invoice;
                        calculateTotals();
                    });
                }
                vm.productSearchModal.hide();
            }
        });

        var uProductTimer = null;

        $scope.$on("$fpm:operation:updateProduct", function ($event, agrs) {
            uProductTimer = $timeout(function () {
                fpmUtilities.showLoading().then(function () {
                    workOrderFactory.getBarcodeInvoiceAndProductDetails(vm.barcode).then(function (response) {
                        vm.barCodeData.products = response.products;
                        vm.barCodeData.invoice = response.invoice;
                        calculateTotals();
                    }).finally(function () {
                        vm.productModal.hide();
                        fpmUtilities.hideLoading();
                    });
                });
            }, 300);
        });


        $scope.$on("$destroy", function () {
            if (uProductTimer) $timeout.cancel(uProductTimer);
            if (findTimeDiffTimer) $timeout.cancel(findTimeDiffTimer);
            if (onTimespanSeletionChangedTimer) $timeout.cancel(onTimespanSeletionChangedTimer);
            if (workOrderMapTimer) $timeout.cancel(workOrderMapTimer);
            if (onInRouteTimespanChangedTimer) $timeout.cancel(onInRouteTimespanChangedTimer);
            //vm.map = null;
            isMapLoaded = false;
        });

        getBarcodeDetails();

        activateController();

        $scope.$on("$ionicView.beforeEnter", function (e, data) {
            //console.log("HEHEHEHEHEHE");
        });
    }
    initController.$inject = ["$scope", "$state", "$q", "$timeout", "$window", "$stateParams", "$ionicActionSheet", "$ionicNavBarDelegate",
        "$ionicLoading", "$ionicPopup", "$ionicModal", "work-orders-factory", "fpm-utilities-factory",
        "shared-data-factory", "authenticationFactory", "timecard-factory"
    ];
    angular.module("fpm").controller("edit-order-controller", initController);
})(); 