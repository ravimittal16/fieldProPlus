(function () {
  "use strict";
  // HELLO WORLD
  function initController(
    $scope,
    $state,
    $rootScope,
    $q,
    $timeout,
    $window,
    $stateParams,
    $ionicActionSheet,
    $ionicLoading,
    $ionicTabsDelegate,
    workOrderFactory,
    fpmUtilities,
    sharedDataFactory,
    authenticationFactory,
    timecardFactory
  ) {
    var vm = this;
    var _index = $stateParams._i === undefined ? 0 : $stateParams._i;
    vm.barcode = $stateParams.barCode;
    vm.taxCheckboxVisibility = true;
    vm.pendingPreviousDayClockout = false;
    var alerts = fpmUtilities.alerts;
    var __customerNumber = "";
    var __skipTimecardCheckFor = ["97713", "97719"];
    var __skipTimecardClockInValidationOnCheckInOut = false;
    var jobStatus = {
      AcceptJob: 0,
      InRoute: 1,
      CheckIn: 2,
      CheckOut: 3
    };
    var jobCodes = timecardFactory.statics.jobCodes;
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
      enableMarkup: false,
      hideEmailButton: false,
      customField2Label: "Custom 2",
      customField3Label: "Custom 3",
      expenseTrackingEnabled: true,
      paymentOn: false
    };

    // TAX RATE CODE CHANGES
    //==================================================

    vm.numpad = null;
    vm.numpadSettings = {
      display: "bottom",
      min: 0,
      scale: 2,
      max: 99999.99,
      preset: "decimal",
      onClose: function (event, inst) {
        if (vm.barCodeData) {
          if (
            vm.barCodeData.taxRate &&
            vm.barCodeData.taxRate.toString() !== event.toString()
          ) {
            vm.barCodeData.taxRate = event;
            workOrderFactory
              .updateTaxRate(vm.barcode, event)
              .then(function (response) {
                vm.barCodeData.taxRate = vm.barCodeData.taxRate.toFixed(2);
              });
          }
          calculateTotals();
        }
      }
    };

    //==================================================
    vm.errors = [];
    vm.gettingBarcodeDetails = true;

    function getBarcodeDetails() {
      vm.gettingBarcodeDetails = true;
      $ionicLoading
        .show({
          template: "loading work order..."
        })
        .then(function () {
          workOrderFactory
            .getBarcodeDetails(vm.barcode)
            .then(
              function (response) {
                vm.gettingBarcodeDetails = false;
                vm.barCodeData = angular.copy(response);

                vm.barCodeData.taxRate = vm.barCodeData.taxRate.toFixed(2);
                vm.uiSettings.woData = angular.copy(response);
                vm.taxCheckboxVisibility = (vm.barCodeData.taxRate || 0) > 0;
                if (
                  angular.isArray(response.schedules) &&
                  response.schedules.length > 0
                ) {
                  vm.schedule = angular.copy(
                    _.findWhere(response.schedules, {
                      num: parseInt($stateParams.technicianNum, 10)
                    })
                  );
                  if (angular.isDefined(vm.schedule)) {
                    if (vm.schedule.actualStartDateTime) {
                      vm.schedule.actualStartDateTime = kendo.parseDate(
                        vm.schedule.actualStartDateTime
                      );
                      vm.schedule.actualStartDateTimeString = kendo.toString(
                        kendo.parseDate(vm.schedule.actualStartDateTime),
                        "g"
                      );
                    }
                    if (vm.schedule.actualFinishDateTime) {
                      vm.schedule.actualFinishDateTime = kendo.parseDate(
                        vm.schedule.actualFinishDateTime
                      );
                      vm.schedule.actualFinishDateTimeString = kendo.toString(
                        kendo.parseDate(vm.schedule.actualFinishDateTime),
                        "g"
                      );
                    }
                    findTimeDiff(
                      vm.schedule.actualStartDateTime,
                      vm.schedule.actualFinishDateTime
                    );
                    if (vm.uiSettings.billingOption === 0) {
                      vm.schedule.inRouteStartTime = kendo.parseDate(
                        vm.schedule.inRouteStartTime
                      );
                      vm.schedule.inRouteEndTime = kendo.parseDate(
                        vm.schedule.inRouteEndTime
                      );
                    }
                    if (
                      vm.uiSettings.billingOption === 0 &&
                      vm.uiSettings.isRouteTimeOptionChecked
                    ) {
                      findTimeDiff(
                        vm.schedule.inRouteStartTime,
                        vm.schedule.inRouteEndTime,
                        true
                      );
                    }
                    vm.uiSettings.orderBelongToCurrentUser =
                      vm.schedule.technicianNum === vm.userId;
                    calculateTotals();
                  } else {
                    calculateTotals();
                  }
                } else {
                  calculateTotals();
                }
                // ==========================================================
                // checking previous timecard
                // ==========================================================
                $timeout(function () {
                  var cdt = new Date();
                  var dt = fpmUtilities.toStringDate(
                    new Date(cdt.getFullYear(), cdt.getMonth(), cdt.getDate(), 0, 0, 0, 0)
                  );
                  if (vm.schedule) {
                    timecardFactory.checkPreviousDateClockIn({
                      timecardDate: dt,
                      userEmail: vm.schedule.technicianNum
                    }).then(function (response) {
                      vm.timecardClockinStat = response;
                    });
                  }
                }, 100);
              },
              function () {
                alerts.alert(
                  "Oops",
                  "ERROR WHILE GETTING WORK ORDER INFORMATION..",
                  $ionicLoading.hide
                );
              }
            )
            .finally(function () {
              $ionicLoading.hide();
              $scope.$broadcast("scroll.refreshComplete");
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
        var ft = new Date(
          fd.getFullYear(),
          fd.getMonth(),
          fd.getDate(),
          fd.getHours(),
          fd.getMinutes(),
          0,
          0
        );
        var st = new Date(
          sd.getFullYear(),
          sd.getMonth(),
          sd.getDate(),
          sd.getHours(),
          sd.getMinutes(),
          0,
          0
        );
        var totalMintues = moment(ft).diff(moment(st), "minutes");
        var mins = totalMintues % 60;
        var hours = Math.floor(totalMintues / 60);
        findTimeDiffTimer = $timeout(function () {
          if (forInRoute) {
            if (hours === 0) {
              vm.scheduleTimeSpan.inRouteTimeSpan = mins + " Minutes";
            } else {
              vm.scheduleTimeSpan.inRouteTimeSpan =
                hours + " Hours " + mins + " Minutes";
            }
          } else {
            if (hours === 0) {
              vm.scheduleTimeSpan.timeSpan = mins + " Minutes";
            } else {
              vm.scheduleTimeSpan.timeSpan =
                hours + " Hours " + mins + " Minutes";
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
      findTimeDiff(
        vm.schedule.inRouteStartTime,
        vm.schedule.inRouteEndTime,
        true
      );
      updateSchedule(false, false);
    }

    var onTimespanSeletionChangedTimer = null;

    function onActualTimesChanged(isStartTime) {
      if (vm.uiSettings.billingOption === 0 && vm.schedule) {
        if (
          vm.schedule.actualStartDateTime &&
          vm.schedule.actualFinishDateTime
        ) {
          if (
            new Date(vm.schedule.actualStartDateTime) >
            new Date(vm.schedule.actualFinishDateTime)
          ) {
            alerts.alert(
              "Warning",
              isStartTime ?
              "Start time cannot be greater than finish time." :
              "Finish time cannot be less than start time"
            );
          } else {
            findTimeDiff(
              vm.schedule.actualStartDateTime,
              vm.schedule.actualFinishDateTime
            ).then(function (totalMins) {
              if (!vm.schedule.approve) {
                updateSchduleTotalTime();
              }
            });
          }
        } else {
          updateSchduleTotalTime();
        }
      } else {
        updateSchedule(false, false);
      }
    }

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
        onActualTimesChanged(true);
      },
      onEndDateTimeChanged: function () {
        onActualTimesChanged(false);
      },
      clearAllDateTimeSelection: function () {}
    };

    function checkAuthorizationIfServiceProvider(co, cb, fromAddSchedule) {
      if (vm.schedule) {
        var havingGroupsAssigned = vm.user.havingGroupsAssigned;
        if (vm.isServiceProvider === false) {
          return true;
        }
        var isBeongToCurrentUser =
          vm.schedule.technicianNum === vm.user.userEmail;
        if (
          havingGroupsAssigned &&
          fromAddSchedule &&
          fromAddSchedule === true
        ) {
          var checkifBelongToAssinedUser = _.findWhere(vm.serviceProviders, {
            userId: vm.schedule.technicianNum
          });
          if (angular.isDefined(checkifBelongToAssinedUser)) {
            return true;
          }
        }
        if (vm.isServiceProvider && !isBeongToCurrentUser) {
          alerts.alert(
            "Oops!",
            "you are not authorized to perform this action",
            function () {
              if (angular.isFunction(cb) && co) {
                cb(co);
              }
            }
          );
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
      sch.actualStartDateTime = kendo.toString(
        vm.schedule.actualStartDateTime,
        "g"
      );
      sch.actualFinishDateTime = kendo.toString(
        vm.schedule.actualFinishDateTime,
        "g"
      );
      workOrderFactory.updateSchduleTotalTime(sch).then(function (response) {
        if (response) {
          vm.barCodeData.schedules = response.schedule;
          vm.barCodeData.invoice = response.invoice;
          calculateTotals();
        }
      });
    }

    var __customPushToTimecardCustomers = ["97713"]

    function __customPushToTimecard() {}

    function pushToTimecard() {
      var model = {
        num: 0,
        numFromSummary: 0,
        timeCardDate: fpmUtilities.toStringDate(
          vm.schedule.actualStartDateTime
        ),
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
            // ==========================================================
            // Updating timecard component
            // ==========================================================
            if (vm.user.timecardAccessLevel === 3) {
              $scope.$broadcast("$timecard.refreshTimecard.pushToTimecard", {
                scheduleNum: vm.schedule.num
              });
            }
          }
        });
      } else {
        alerts.alert("Warning", "Please select Check In date and time");
      }
    }
    var currentLoc = null;

    function _getCurrentUserLocation() {
      if ($rootScope.currentLocation) {
        currentLoc = $rootScope.currentLocation;
      } else {
        if (
          fpmUtilities.device.isIOS() &&
          $rootScope.locationTrackingOn &&
          window.BackgroundGeolocation
        ) {
          window.BackgroundGeolocation.getCurrentPosition(function (
            location,
            taskId
          ) {
            window.BackgroundGeolocation.finish(taskId);
            currentLoc = location;
          });
        }
      }
    }
    //================================================================================================
    vm.user = authenticationFactory.getLoggedInUserInfo();
    vm.dateTimeFormat = vm.user.dateFormat;
    vm.placeholder = "tap here to select...";




    function activateController() {
      // ==========================================================
      // WE NEED TO SKIP THE CLOCK IN CHECK FOR SOME CUSTOMERS
      // ==========================================================
      __customerNumber = vm.user.customerNumber;
      __skipTimecardClockInValidationOnCheckInOut = __skipTimecardCheckFor.indexOf(__customerNumber) > -1;
      // ==========================================================
      if (!$rootScope.isInDevMode) {
        _getCurrentUserLocation();
      }
      isMapLoaded = false;
      vm.uiSettings.isTimeCardModuleEnabled =
        vm.user.timeCard && vm.user.allowPushTime;

      vm.isServiceProvider = !vm.user.isAdminstrator;
      vm.showPrice = vm.user.showPrice;
      sharedDataFactory
        .getIniitialData(true)
        .then(function (response) {
          if (response) {
            vm.uiSettings.milageTrackingEnabled =
              response.customerNumberEntity.milageTrackingEnabled || false;
            vm.uiSettings.timerEnabled =
              response.customerNumberEntity.workOrderTimerEnabled || false;
            vm.uiSettings.showEquipmentTabControl =
              response.customerNumberEntity.equipmentTrackingOn || false;
            vm.uiSettings.enableMarkup =
              response.customerNumberEntity.enableMarkupForWorkOrders || false;
            vm.uiSettings.paymentOn =
              response.customerNumberEntity.paymentOn || false;
            vm.enableMarkup = vm.uiSettings.enableMarkup;
            if (response.customerNumberEntity.billingOption) {
              vm.uiSettings.billingOption =
                response.customerNumberEntity.billingOption;
            }
            vm.poHeading = "PO Number";

            if (vm.uiSettings.billingOption === 0) {
              vm.uiSettings.isRouteTimeOptionChecked =
                response.customerNumberEntity.isRouteTimeOptionChecked;
            }
            vm.uiSettings.expenseTrackingEnabled =
              response.customerNumberEntity.expenseTrackingEnabled;
            if (response.customerNumberEntity.configurationJson) {
              var configurations = JSON.parse(
                response.customerNumberEntity.configurationJson
              );
              vm.uiSettings.hideEmailButton =
                configurations.HideEmailButtonOnMobile || false;
              if (configurations && configurations.PoBoxLabel) {
                vm.poHeading = configurations.PoBoxLabel;
              } else if (
                response.customerNumberEntity.intuitServiceType === "QBO"
              ) {
                vm.poHeading = "Custom 1";
              } else {
                vm.poHeading = "PO Number";
              }
              if (
                configurations.CustomField2Label &&
                configurations.CustomField2Label !== ""
              ) {
                vm.uiSettings.customField2Label =
                  configurations.CustomField2Label;
              }
              if (
                configurations.CustomField3Label &&
                configurations.CustomField3Label !== ""
              ) {
                vm.uiSettings.customField3Label =
                  configurations.CustomField3Label;
              }
            }
            vm.scheduleStatus = response.secondaryOrderStatus;
            vm.serviceProviders = response.serviceProviders;
            vm.vehicles = response.vehicles;
          }
        })
        .finally(_getTodaysTimeCardEntries);
    }

    function calculateTotals() {
      var totals = {
        subtotal: 0,
        totalqty: 0,
        totalcost: 0,
        totaltax: 0
      };
      if (vm.barCodeData.invoice && vm.barCodeData.invoice.length > 0) {
        var taxRate = vm.barCodeData.taxRate || 0;
        var totalTax = 0;
        angular.forEach(vm.barCodeData.invoice, function (pro, i) {
          if (pro.price && pro.qty) {
            var totalPrice = 0;
            if (!angular.isDefined(pro.newPriceCalculated)) {
              pro.newPriceCalculated = false;
            }
            if (
              angular.isNumber(parseFloat(pro.price)) &&
              angular.isNumber(parseInt(pro.qty, 10))
            ) {
              if (pro.markup > 0) {
                var newPrice = pro.newPriceCalculated ?
                  pro.price :
                  parseFloat(pro.price) +
                  parseFloat(((pro.markup || 0) / 100) * pro.price);
                pro.price = newPrice;
                pro.newPriceCalculated = true;
                totalPrice = newPrice * pro.qty;
              } else {
                totalPrice = pro.price * pro.qty;
              }
              pro.totalPrice = totalPrice;
              var taxAmt = parseFloat(
                parseFloat(taxRate) > 0 ?
                parseFloat((taxRate / 100) * totalPrice) :
                0
              );
              totals.subtotal += parseFloat(totalPrice);
              totals.totalqty += parseInt(pro.qty, 10);
              if (pro.taxable) {
                totalTax += parseFloat(taxAmt);
              }
            }
          }
          if (i === vm.barCodeData.invoice.length - 1) {
            totals.totaltax = totalTax;
            vm.totals = totals;
          }
        });
      } else {
        vm.totals = totals;
      }
    }

    function updateOrder(type) {
      function _processUpdateOrder() {
        workOrderFactory
          .updateWorkOrderMobile({
            barcodeAssay: vm.barCodeData.barcodeDetails,
            fromMobile: true
          })
          .then(function (response) {
            if (response && angular.isArray(response) && response.length > 0) {
              vm.errors = response;
            }
          });
      }
      if (type && type === "desc") {
        _processUpdateOrder();
      } else {
        if (checkAuthorizationIfServiceProvider(null, null, false)) {
          _processUpdateOrder();
        }
      }
    }

    function updateSchedule(showSuccessAlert, showLoading, callback) {
      var sch = angular.copy(vm.schedule);

      if (vm.schedule.actualStartDateTime) {
        sch.actualStartDateTime = kendo.toString(
          vm.schedule.actualStartDateTime,
          "g"
        );
      }
      if (vm.schedule.actualFinishDateTime) {
        sch.actualFinishDateTime = kendo.toString(
          vm.schedule.actualFinishDateTime,
          "g"
        );
      }
      if (vm.schedule.inRouteStartTime) {
        sch.inRouteStartTime = kendo.toString(
          vm.schedule.inRouteStartTime,
          "g"
        );
      }
      if (vm.schedule.inRouteEndTime) {
        sch.inRouteEndTime = kendo.toString(vm.schedule.inRouteEndTime, "g");
      }
      if (showLoading === true) {
        fpmUtilities.showLoading().then(function () {
          workOrderFactory
            .updateSchedule(sch)
            .then(function (response) {
              if (response && response !== "") {
                alerts.alert("Warning", response, function () {
                  vm.schedule.workComplete = false;
                });
              } else {
                if (showSuccessAlert) {
                  alerts.alert(
                    "Success",
                    "Schedule information updated successfully",
                    function () {
                      if (angular.isFunction(callback)) {
                        callback();
                      }
                    }
                  );
                } else {
                  if (angular.isFunction(callback)) {
                    callback();
                  }
                }
              }
            })
            .then(fpmUtilities.hideLoading);
        });
      } else {
        workOrderFactory.updateSchedule(sch).then(function () {
          if (showSuccessAlert) {
            alerts.alert(
              "Success",
              "Schedule information updated successfully",
              function () {
                if (angular.isFunction(callback)) {
                  callback();
                }
              }
            );
          } else {
            if (angular.isFunction(callback)) {
              callback();
            }
          }
        });
      }
    }

    var actions = [{
        text: '<span class="text-assertive">Clear All</span>'
      },
      {
        text: '<span class="text-assertive">Clear Checkout Time</span>'
      },
      {
        text: "Update Schedule"
      }
    ];

    function restoreSchedule(o) {
      if (vm.uiSettings.woData) {
        var s = _.findWhere(vm.uiSettings.woData.schedules, {
          num: o.num
        });
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
        var s = _.findWhere(vm.uiSettings.woData.invoice, {
          num: o.num
        });
        if (angular.isDefined(s)) {
          for (var prop in s) {
            if (o.hasOwnProperty(prop)) {
              o[prop] = s[prop];
            }
          }
        }
      }
    }

    function processCheckIn(refreshDetails) {
      fpmUtilities.showLoading().then(function () {
        vm.schedule.actualStartDateTime = new Date();
        vm.schedule.actualFinishDateTime = null;
        vm.scheduleTimeSpan.onStartDateTimeChaged();
        workOrderFactory
          .updateJobStatus({
            scheduleButton: jobStatus.CheckIn,
            scheduleNum: vm.schedule.num,
            actualStartTime: fpmUtilities.toStringDate(
              vm.schedule.actualStartDateTime
            ),
            barcode: vm.barcode,
            timerStartAt: fpmUtilities.toStringDate(new Date()),
            clientTime: kendo.toString(new Date(), "g")
          })
          .then(function () {
            vm.schedule.checkInStatus = true;
          })
          .finally(function () {
            fpmUtilities.hideLoading();
            if (vm.user.timeCard && refreshDetails) {
              _getTodaysTimeCardEntries(false);
            }
          });
      });
    }

    function openProductSearchModal() {
      if (vm.productSearchModal) {
        vm.productSearchModal.show();
      } else {
        fpmUtilities
          .getModal("productSearchModal.html", $scope)
          .then(function (modal) {
            vm.productSearchModal = modal;
            vm.productSearchModal.show();
          });
      }
      $timeout(function () {
        $scope.$broadcast("$fpm:changeAddModalOpenPriority", true);
      }, 1000);
    }

    function openEditProductModal() {
      if (vm.productModal) {
        vm.productModal.show();
      } else {
        fpmUtilities
          .getModal("editProductModal.html", $scope)
          .then(function (modal) {
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
      var daddr = "";
      var d = vm.barCodeData.barcodeDetails;
      if (d.shipStreet) {
        daddr += d.shipStreet.replace("::", " ");
        daddr += "%20" + d.shipCity + ",%20" + d.shipState + "%20" + d.shipZIP;
      }
      if (currentLoc) {
        var goourl = "https://maps.google.com?saddr=";
        goourl +=
          currentLoc.coords.latitude +
          "," +
          currentLoc.coords.longitude +
          "&daddr=";
        goourl += daddr;
        $window.open(goourl, "_system", "location=yes").then(
          function () {},
          function (event) {}
        );
      } else {
        goourl = "https://maps.google.com?daddr=" + daddr;
        $window.open(goourl, "_system", "location=yes");
      }
    }
    vm.popupDescriptionBoxType = "";
    vm.popModal = {
      type: "DESCRIPTION",
      modal: null,
      placeholder: "enter here...",
      content: ""
    };

    function _processScheduleCheckout() {
      vm.schedule.actualFinishDateTime = new Date();
      vm.scheduleTimeSpan.onEndDateTimeChanged();
      workOrderFactory
        .updateJobStatus({
          scheduleButton: jobStatus.CheckOut,
          scheduleNum: vm.schedule.num,
          actualEndTime: fpmUtilities.toStringDate(
            vm.schedule.actualFinishDateTime
          ),
          Barcode: vm.barcode,
          clientTime: kendo.toString(new Date(), "g")
        })
        .then(function () {
          vm.schedule.checkOutStatus = true;
        });
    }

    function __checkoutPendingTask(_e) {
      fpmUtilities.showLoading().then(function () {
        timecardFactory
          .checkoutPending(_e)
          .then(
            function (response) {
              if (response && response.success) {
                if (_e.scheduleId) {
                  workOrderFactory
                    .updateJobStatus({
                      scheduleButton: jobStatus.CheckOut,
                      scheduleNum: _e.scheduleId,
                      actualEndTime: fpmUtilities.toStringDate(
                        new Date()
                      ),
                      barcode: vm.barcode,
                      clientTime: kendo.toString(
                        new Date(),
                        "g"
                      )
                    })
                    .then(function () {
                      alerts.alert(
                        "Success!",
                        "Pending task checked out successfully.",
                        function () {
                          processCheckIn(true);
                        }
                      );
                    })
                    .finally(function () {
                      fpmUtilities.hideLoading();
                    });
                } else {
                  alerts.alert(
                    "Success!",
                    "Pending task checked out successfully.",
                    function () {
                      processCheckIn(true);
                      fpmUtilities.hideLoading();
                    }
                  );
                }
              } else {
                alerts.alert(
                  "Invalid Time",
                  "Go to Timecard and checkout manually."
                );
              }
            },
            function () {
              fpmUtilities.hideLoading();
            }
          )
          .finally(function () {});
      });
    }



    vm.tabs = {
      events: {
        updateClicked: function () {
          if (vm.popModal.type === "DESCRIPTION") {
            var oldDesc = vm.uiSettings.woData.barcodeDetails.comment_1;
            var newDesc = vm.popModal.content;
            if (!vm.user.allowUserToEditWoDescription && oldDesc !== newDesc) {
              alerts.alert(
                "Unauthorized",
                "You are not authorized to change the description.",
                function () {
                  $timeout(function () {
                    vm.barCodeData.barcodeDetails.comment_1 = oldDesc;
                  }, 400);
                }
              );
              return false;
            } else {
              vm.barCodeData.barcodeDetails.comment_1 = angular.copy(
                vm.popModal.content
              );
            }
          }
          if (vm.popModal.type === "RESOLUTION") {
            vm.barCodeData.barcodeDetails.comment_2 = angular.copy(
              vm.popModal.content
            );
          }
          if (vm.popModal.type === "COMMENTS") {
            vm.barCodeData.barcodeDetails.comment_4 = angular.copy(
              vm.popModal.content
            );
          }
          if (vm.popModal.type === "TRIP_NOTES") {
            vm.schedule.tripNote = angular.copy(vm.popModal.content);
            updateSchedule(false, false);
          }
          updateOrder(vm.popModal.type === "DESCRIPTION" ? "desc" : null);
          vm.popModal.modal.hide();
        },
        closePopoutModal: function () {
          vm.popModal.modal.hide();
        },
        popoutTextBox: function (type) {
          vm.popupDescriptionBoxType = type;
          switch (type) {
            case "DESCRIPTION":
              vm.popModal.content = angular.copy(
                vm.barCodeData.barcodeDetails.comment_1
              );
              break;
            case "RESOLUTION":
              vm.popModal.content = angular.copy(
                vm.barCodeData.barcodeDetails.comment_2
              );
              break;
            case "COMMENTS":
              vm.popModal.content = angular.copy(
                vm.barCodeData.barcodeDetails.comment_4
              );
              break;
            case "TRIP_NOTES":
              vm.popModal.content = angular.copy(vm.schedule.tripNote);
              break;
          }
          vm.popModal.type = type;
          if (vm.popModal.modal) {
            vm.popModal.modal.show();
          } else {
            fpmUtilities
              .getModal("fulltextModal.html", $scope)
              .then(function (modal) {
                vm.popModal.modal = modal;
                vm.popModal.modal.show();
              });
          }
        }
      },
      desc: {
        events: {
          reloadWorkResolution: function () {
            if (checkAuthorizationIfServiceProvider()) {
              fpmUtilities.showLoading().then(function () {
                var id = vm.barCodeData.barcodeDetails.id;
                workOrderFactory
                  .getWorkOrderResolution(id)
                  .then(function (response) {
                    if (response) {
                      vm.barCodeData.barcodeDetails.comment_2 =
                        response.comment_2;
                      vm.barCodeData.barcodeDetails.comment_4 =
                        response.comment_4;
                    }
                  })
                  .finally(fpmUtilities.hideLoading);
              });
            }
          },
          refreshOnPullDown: function () {
            getBarcodeDetails();
            _getTodaysTimeCardEntries(false);
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
          onDescriptionOrResolutionChanged: function (type) {
            if (type && type === "desc") {
              var oldDesc = vm.uiSettings.woData.barcodeDetails.comment_1;
              var newDesc = vm.barCodeData.barcodeDetails.comment_1;
              if (
                !vm.user.allowUserToEditWoDescription &&
                oldDesc !== newDesc
              ) {
                // alerts.alert(
                //   "Unauthorized",
                //   "You are not authorized to change the description.",
                //   function() {
                //     $timeout(function() {
                //       vm.barCodeData.barcodeDetails.comment_1 = oldDesc;
                //     }, 400);
                //   }
                // );
                return false;
              }
            }
            updateOrder(type);
          }
        }
      },
      sch: {
        events: {
          workCompleteChanged: function () {
            if (
              checkAuthorizationIfServiceProvider(
                vm.schedule,
                restoreSchedule,
                false
              )
            ) {
              updateSchedule(true, true, function () {
                $timeout(function () {
                  $state.go("app.dashboard", {
                    refresh: true
                  });
                }, 200);
              });
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
              vm.scheduleAddModal.hide().then(function () {
                alerts.alert(
                  "Success",
                  "Schedule added successfully",
                  function () {
                    vm.barCodeData.schedules = o.schedules;
                    vm.barCodeData.invoice = o.invoice;
                    calculateTotals();
                  }
                );
              });
            }
          },
          onModalCancelClicked: function () {
            vm.scheduleAddModal.hide();
          },
          updateMilage: function () {
            if (vm.schedule.startMiles && vm.schedule.endMiles) {
              vm.schedule.totalMiles = parseFloat(
                parseFloat(vm.schedule.endMiles) -
                parseFloat(vm.schedule.startMiles)
              ).toFixed(2);
            }
            updateSchedule(false, false);
          },
          onTripnoteChanged: function () {
            updateSchedule(false, false);
          },
          updateSchedule: function () {
            updateSchedule(true, true);
          },
          onListScheduleItemTap: function (sch) {
            if (sch.num !== vm.schedule.num) {
              alerts.confirm(
                "Confirmation",
                "Do you want to load this schedule?",
                function () {
                  $state.go("app.editOrder", {
                    barCode: vm.barcode,
                    technicianNum: sch.num,
                    src: "main",
                    _i: 1
                  });
                }
              );
            }
          },
          onSchedulesListButtonClicked: function () {
            if (vm.scheduleAddModal === null) {
              fpmUtilities
                .getModal("addScheduleModal.html", $scope)
                .then(function (modal) {
                  vm.scheduleAddModal = modal;
                  vm.scheduleAddModal.show();
                });
            } else {
              vm.scheduleAddModal.show();
            }
          },
          checkIn: function () {
            if (
              vm.schedule.approve ||
              vm.schedule.checkInStatus
            ) {
              alerts.alert("Alert", "Not allowed to checkin");
            } else {
              if (checkAuthorizationIfServiceProvider(null, null, true)) {
                var isBeongToCurrentUser =
                  vm.schedule.technicianNum === vm.user.userEmail;
                if (vm.user.timeCard && isBeongToCurrentUser && !__skipTimecardClockInValidationOnCheckInOut) {
                  var runningClockIn = _.where(timeCardInfo.currentDetails, {
                    jobCode: jobCodes.CLOCK_IN,
                    finishTime: null
                  });
                  var checkins = _.reject(timeCardInfo.currentDetails, {
                    jobCode: jobCodes.CLOCK_IN
                  });
                  var cdt = new Date();
                  var dt = fpmUtilities.toStringDate(
                    new Date(cdt.getFullYear(), cdt.getMonth(), cdt.getDate(), 0, 0, 0, 0)
                  );

                  if (runningClockIn.length === 0) {
                    // ==========================================================
                    // CHECKING PREVIOUS DAY CLOCK OUT
                    // ==========================================================
                    timecardFactory.checkPreviousDateClockIn({
                      timecardDate: dt,
                      userEmail: vm.schedule.technicianNum,
                      previousDayCheck: true
                    }).then(function (response) {
                      if (response && response.previousDayCheck && response.lastClockOut === null && response.hasPendingClockIn) {
                        // ==========================================================
                        // USER HAS NOT CLOCKED OUT FOR YESTERDAY 
                        // ==========================================================
                        alerts.confirm(
                          "Confirmation!",
                          "You have not clocked out for yesterday. \n\n Are you sure?",
                          function () {
                            processCheckIn(true);
                          },
                          function () {}
                        );
                      } else {
                        // ==========================================================
                        // USER HAS NOT CLOCKED IN FOR TODAY
                        // ==========================================================
                        alerts.confirm(
                          "Confirmation!",
                          "You have not clocked in yet. You will be clocked in automattically \n\n Are you sure?",
                          function () {
                            processCheckIn(true);
                          },
                          function () {}
                        );
                      }
                    });
                  } else {
                    if (checkins.length > 0) {
                      var runningCheckIn = _.where(checkins, {
                        finishTime: null,
                        jobCodeName: "On Job"
                      });
                      if (runningCheckIn.length > 0) {
                        var _defaultActions = [{
                            text: "Check-out the pending task"
                          },
                          {
                            text: "Open pending schedule"
                          },
                          {
                            text: "Goto Timecard"
                          }
                        ];
                        $ionicActionSheet.show({
                          buttons: _defaultActions,
                          titleText: "Pending Check-out Actions",
                          cancelText: "Cancel",
                          cancel: function () {
                            // add cancel code..
                          },
                          buttonClicked: function (index) {
                            var _e = angular.copy(runningCheckIn[0]);
                            if (index === 0) {
                              alerts.confirm(
                                "Confirmation!",
                                "Are you sure to check-out?",
                                function () {
                                  __checkoutPendingTask(_e);
                                }
                              );
                            }
                            if (index === 1) {
                              if (_e.scheduleId && _e.scheduleId > 0) {
                                workOrderFactory
                                  .checkIfBarcodeClosed(_e.barcode)
                                  .then(function (isClosed) {
                                    if (isClosed !== null && !isClosed) {
                                      $state.go(
                                        "app.editOrder", {
                                          barCode: _e.barcode,
                                          technicianNum: _e.scheduleId,
                                          src: "main",
                                          _i: 1
                                        }, {
                                          reload: true
                                        }
                                      );
                                    } else {
                                      alerts.alert(
                                        "Alert",
                                        "Work order has been closed. Please go to timecard and check-out manually."
                                      );
                                    }
                                  });
                              } else {
                                $state.go("app.timecard", {
                                  refresh: true
                                });
                              }
                            }
                            if (index === 2) {
                              $state.go("app.timecard", {
                                refresh: true
                              });
                            }
                            return true;
                          }
                        });
                      } else {
                        processCheckIn(true);
                      }
                    } else {
                      processCheckIn(true);
                    }
                  }
                } else {
                  processCheckIn(true);
                }
              }
              return false;
            }
          },
          checkOut: function () {
            if (
              vm.schedule.approve ||
              vm.schedule.checkOutStatus
            ) {
              alerts.alert("Alert", "Not allowed to checkout");
            } else {
              if (checkAuthorizationIfServiceProvider(null, null, false)) {
                if (vm.schedule.actualStartDateTime === null || !vm.schedule.checkInStatus) {
                  alerts.alert("Warning", "Please check in first");
                  return false;
                }
                _processScheduleCheckout();
              }
            }
          },
          clearAllDateTimeSelection: function (clearAll) {
            clearAllDateTimeSelection(clearAll);
          },
          onScheduleActionButtonClicked: function () {
            var defaultActions = angular.copy(actions);
            $ionicActionSheet.show({
              buttons: defaultActions,
              titleText: "Current Schedule",
              cancelText: "Cancel",
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
          onEditTaxRateClicked: function () {
            $timeout(function () {
              vm.numpad.show();
            }, 50);
          },
          onTaxCheckboaxChanged: function (i) {
            if (checkAuthorizationIfServiceProvider(i, restoreInvoice)) {
              $timeout(function () {
                calculateTotals();
                workOrderFactory.updateOrderProduct(i);
              }, 200);
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
          openProductSearchModal: function () {},
          onEditProductClicked: function (product) {
            vm.currentProduct = angular.copy(product);
            openEditProductModal();
          },
          onDeleteProductClicked: function (product) {
            alerts.confirmDelete(function () {
              workOrderFactory
                .deleteProduct(vm.barcode, product.num, product.qty)
                .then(function (response) {
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
    };

    var timeCardInfo = {
      currentDetails: []
    };

    vm.onBarcodeScanned = function (skuCode) {
      workOrderFactory
        .addProductFromBarcodeScanner(skuCode, vm.barcode)
        .then(function (response) {
          if (response) {
            getBarcodeProducts(true);
          } else {
            alerts.alert(
              "Not Found",
              "No product found with this code..",
              null
            );
          }
        });
    };

    function _getTodaysTimeCardEntries(runCheckin) {
      if (vm.user.timeCard) {
        var cdt = new Date();
        var dt = fpmUtilities.toStringDate(
          new Date(cdt.getFullYear(), cdt.getMonth(), cdt.getDate(), 0, 0, 0, 0)
        );
        timecardFactory
          .getTimeCardByDate(dt)
          .then(function (response) {
            if (response) {
              timeCardInfo.currentDetails = response.timeCardDetails;
            }
          })
          .finally(function () {
            if (runCheckin) {
              processCheckIn(true);
            }
          });
      }
    }

    $scope.$on("$fpm:closeEditProductModal", function () {
      if (vm.productModal) {
        vm.productModal.hide();
      }
    });

    function getBarcodeProducts(closeModal) {
      workOrderFactory
        .getBarcodeInvoiceAndProductDetails(vm.barcode)
        .then(function (response) {
          vm.barCodeData.products = response.products;
          vm.barCodeData.invoice = response.invoice;
          calculateTotals();
        })
        .finally(function () {
          if (closeModal) {
            fpmUtilities.hideLoading();
            vm.productModal.hide();
          }
        });
    }

    $scope.$on("$fpm:closeProductSearchModal", function ($event, args) {
      if (vm.productSearchModal) {
        if (args && args.fromProductAdd === true) {
          getBarcodeProducts(false);
        }
        vm.productSearchModal.hide();
      }
    });

    var uProductTimer = null;

    $scope.$on("$fpm:operation:updateProduct", function ($event, agrs) {
      uProductTimer = $timeout(function () {
        fpmUtilities.showLoading().then(function () {
          getBarcodeProducts(true);
        });
      }, 300);
    });

    $scope.$on("$destroy", function () {
      if (uProductTimer) $timeout.cancel(uProductTimer);
      if (findTimeDiffTimer) $timeout.cancel(findTimeDiffTimer);
      if (onTimespanSeletionChangedTimer)
        $timeout.cancel(onTimespanSeletionChangedTimer);
      if (workOrderMapTimer) $timeout.cancel(workOrderMapTimer);
      if (onInRouteTimespanChangedTimer)
        $timeout.cancel(onInRouteTimespanChangedTimer);
      //vm.map = null;
      isMapLoaded = false;
    });

    getBarcodeDetails();
    activateController();
    var $indexTimeout = $timeout(function () {
      if (_index > 0) {
        var _handle = $ionicTabsDelegate.$getByHandle("tabs");
        _handle.select(Number(_index));
      }
      $timeout.cancel($indexTimeout);
    }, 500);
  }
  initController.$inject = [
    "$scope",
    "$state",
    "$rootScope",
    "$q",
    "$timeout",
    "$window",
    "$stateParams",
    "$ionicActionSheet",
    "$ionicLoading",
    "$ionicTabsDelegate",
    "work-orders-factory",
    "fpm-utilities-factory",
    "shared-data-factory",
    "authenticationFactory",
    "timecard-factory"
  ];
  angular.module("fpm").controller("edit-order-controller", initController);
})();
