(function () {
  "use strict";

  function __detailController($rootScope, $scope, $state, $timeout, workOrdersFactory,
    fpmUtilitiesFactory, sharedDataFactory, authenticationFactory, timecardFactory, $ionicPopover, $ionicModal, $ionicActionSheet) {
    var vm = this;
    var __jobCodes = timecardFactory.statics.jobCodes;
    var __statusTypes = timecardFactory.statics.statusTypes;
    var __toDateString = fpmUtilitiesFactory.toStringDate;
    var __isForWorkOrder = false;
    var __havingPreRoute = false;
    var __userEmail = "";
    var alerts = fpmUtilitiesFactory.alerts;
    vm.assgiendToSameUser = false;
    vm.currentDate = new Date();
    vm.dateFormat = $rootScope.dateFormat;

    function __toDate(dateString) {
      return kendo.parseDate(dateString);
    }


    function __toDateString(dateString) {
      return fpmUtilitiesFactory.toStringDate(dateString);
    }

    // ==========================================================
    // TIMEPICKER SETTINGS
    // ==========================================================

    vm.timePicker = {
      settings: {
        timeFormat: 'hh:ii A',
        headerText: '{label} Time',
        theme: "mobiscroll",
        display: "bottom",
        swipeDirection: "vertical"
      },
      prop: null,
      instance: null,
      originalTime: null,
      currentTime: null,
      timecardObject: null,
      onTimeNewPicked: function () {
        var _timeObj = vm.timePicker.timecardObject;
        var __isClockout = _timeObj.jobCode === __jobCodes.CLOCK_IN && vm.timePicker.prop === 'finishTime'
        var _e = angular.copy(_timeObj);
        if (__isClockout) {
          __processClockOutUser(vm.timePicker.currentTime, _timeObj);
        } else {
          _timeObj[vm.timePicker.prop] = vm.timePicker.currentTime;
          _e.startTime = __toDateString(_timeObj.startTime);
          _e.finishTime = __toDateString(_timeObj.finishTime);
          if (!vm.assgiendToSameUser) {
            _e.timecardUserEmailDefined = true;
            _e.timecardUserEmail = __userEmail;
          }
          fpmUtilitiesFactory.showLoading().then(function () {
            timecardFactory.addNewDetails(_e).then(function (response) {
              if (response.errors === null) {
                alerts.alert("Time Added", "Time has been updated.");
                if (vm.data.timeCards.length !== response.timeCardDetails.length) {
                  vm.data.approvalStatus = response.timeCardSummary.approveStatus || 0;
                }
                $timeout(function () {
                  __updateTimeCardsArray(response.timeCardDetails);
                }, 100)
              }
            }).finally(fpmUtilitiesFactory.hideLoading);
          });
        }
      },
      onTimeClicked: function (t, isForStartTime) {
        var __status = vm.data.approvalStatus;
        if (__status === __statusTypes.SEND_FOR_APPROVAL || __status === __statusTypes.APPROVED || __status === __statusTypes.RESENT_FOR_APPROVAL) {
          return false;
        }
        var __isClockout = t.jobCode === __jobCodes.CLOCK_IN && !isForStartTime && t.finishTime === null;
        if (__isClockout) {
          var __notCheckInDetails = _.filter(vm.data.timeCards, function (tc) {
            return tc.finishTime === null && tc.jobCode !== jobCodes.CLOCK_IN;
          });
          if (__notCheckInDetails.length > 0) {
            alerts.confirm("Confirmation!", "You have a task pending to check out. \n\n Previously pending tasks will be checked out automattically. \n\n Are you sure?", function () {
              $timeout(function () {
                __showDateTimePicker(t, isForStartTime);
              }, 20);
            });
          } else {
            alerts.confirm("Confirmation!", "Are you sure?", function () {
              $timeout(function () {
                __showDateTimePicker(t, isForStartTime);
              }, 20);
            });
          }
        } else {
          __showDateTimePicker(t, isForStartTime);
        }
      }
    };

    function __showDateTimePicker(t, isForStartTime) {
      var __headerText = 'SELECT TIME';
      if (t.jobCode === 5001) {
        __headerText = isForStartTime ? 'CLOCK IN' : 'CLOCK OUT';
      } else {
        __headerText = isForStartTime ? 'CHECK IN' : 'CHECK OUT';
      }
      vm.timePicker.prop = isForStartTime ? 'startTime' : 'finishTime';
      if (t[vm.timePicker.prop]) {
        var __dateText = __toDateString(t[vm.timePicker.prop]);
        __headerText = __headerText + " - " + __dateText;
      }
      var __currentVal = __toDate(t[vm.timePicker.prop]);
      if (vm.timePicker.instance) {
        vm.timePicker.timecardObject = t;
        vm.timePicker.originalTime = __currentVal;
        vm.timePicker.instance.settings.headerText = __headerText;
        vm.timePicker.instance.setVal(__currentVal);
        vm.timePicker.instance.show();
      }
    }

    function __toDateObj(dateFrom, timeFrom) {
      var __timeDate = timeFrom || new Date();
      return new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate(), __timeDate.getHours(), __timeDate.getMinutes(), 0, 0)
    }

    function __updateTimeCardsArray(details) {
      // ==========================================================
      // We don't need the sections now
      // ==========================================================
      vm.data.timeCards = details;
    }


    function __calculateTotalPayableTime() {
      vm.data.totalTime = "0";
      vm.data.totalCheckinTime = [];
      //JobCode: jobCodes.CLOCK_IN
      var payables = _.filter(vm.data.timeCards, function (tc) {
        return tc.jobCode === __jobCodes.CLOCK_IN && tc.finishTime !== null;
      });
      var nonPayables = _.filter(vm.data.timeCards, function (tc) {
        return tc.jobCode !== __jobCodes.CLOCK_IN && tc.isPayable === false && tc.finishTime !== null;
      });
      var checkins = _.filter(vm.data.timeCards, function (tc) {
        return tc.jobCode !== __jobCodes.CLOCK_IN && tc.finishTime !== null;
      });
      if (checkins.length > 0) {
        var clockinNums = _.pluck(checkins, 'clockInNum');
        var distinctClockInNums = _.uniq(clockinNums);
        angular.forEach(distinctClockInNums, function (cn, i) {
          var totalCheckinsMins = 0;
          angular.forEach(checkins, function (e, i) {
            if (e.clockInNum == cn)
              totalCheckinsMins += moment(kendo.parseDate(e.finishTime)).diff(kendo.parseDate(e.startTime), "minutes");
          });
          var hours = Math.floor(totalCheckinsMins / 60);
          var mintues = totalCheckinsMins % 60;
          vm.data.totalCheckinTime[cn] = hours + " hrs " + mintues + " min";
        });

      } else {
        vm.data.totalcheckinTime = "0 hrs 0 min";
        return;
      }
      var totalPayableMins = 0;
      if (payables.length > 0) {
        angular.forEach(payables, function (e, i) {
          totalPayableMins += moment(kendo.parseDate(e.finishTime)).diff(kendo.parseDate(e.startTime), "minutes");
        });
      } else {
        vm.data.totalTime = "0 hrs 0 min";
        return;
      }

      if (nonPayables.length > 0) {
        var totalNonPMins = 0;
        angular.forEach(nonPayables, function (e, i) {
          totalNonPMins += moment(kendo.parseDate(e.finishTime)).diff(kendo.parseDate(e.startTime), "minutes");
          if (i === nonPayables.length - 1) {
            totalPayableMins = totalPayableMins - totalNonPMins;
            if (totalPayableMins > 0) {
              var hours = Math.floor(totalPayableMins / 60);
              var mintues = totalPayableMins % 60;
              vm.data.totalTime = hours + " hrs " + mintues + " min";
            } else {
              vm.data.totalTime = "0 hrs 0 min";
            }
          }
        });
      } else {
        var hours = Math.floor(totalPayableMins / 60);
        var mintues = totalPayableMins % 60;
        vm.data.totalTime = hours + " hrs " + mintues + " min";
      }
    }

    function __processClockOutUser(clockInDateTime, __details) {
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
        startTime: __toDateString(clockOutTime),
        jobCode: __jobCodes.CLOCK_OUT,
        numFromSummary: vm.data.summary.num,
        timeCardDate: __toDateString(tcd),
      };
      if (!vm.assgiendToSameUser) {
        details.timecardUserEmailDefined = true;
        details.timecardUserEmail = __userEmail;
      }
      if (vm.data.currentClockedIn) {
        details["uniqueIdentifier"] = vm.data.currentClockedIn.uniqueIdentifier;
      } else {
        details["uniqueIdentifier"] = __details.uniqueIdentifier;
      }
      fpmUtilitiesFactory.showLoading().then(function () {
        timecardFactory.clockInOutUser(details).then(function (response) {
          if (response && response.errors === null) {
            vm.data.clockOutDateTime = clockOutTime;
            vm.data.isClockedOut = true;
            vm.data.isClockedIn = false;
            vm.data.disableClockOutButton = true;
            vm.data.addTimeVisibility = false;
            vm.data.ptoButtonVisibility = true;
            vm.data.summary = response.timeCardSummary;
            var dt = vm.currentDate ? vm.currentDate : new Date();
            var cDate = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0);
            var tcDate = new Date(tcd.getFullYear(), tcd.getMonth(), tcd.getDate(), 0, 0, 0, 0);
            if (moment(tcDate).isSameOrAfter(cDate)) {
              vm.data.disableClockInButton = false;
            }
            vm.data.approvalStatus = response.timeCardSummary.approveStatus || 0;
            __updateTimeCardBindings(response);
          } else {
            alerts.alert("Error", "Not able to perform clock out");
          }
        }).finally(function () {
          fpmUtilitiesFactory.hideLoading();
        });
      });
    }

    function __showModal() {
      if (vm.data.isFromPto && vm.data.summary === null) {
        vm.data.summary = {
          num: 0,
          timeCardDate: vm.currentDate
        };
        timecardFactory.summary = vm.data.summary;
      }
      if (vm.data.addEditDetailsModal === null) {
        $ionicModal.fromTemplateUrl("timecardDetailsModal.html", {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function (modal) {
          vm.data.addEditDetailsModal = modal;
          $timeout(function () {
            $scope.$broadcast("timecard:addEditDetailsModal:open", {
              isFromPto: vm.data.isFromPto,
              details: vm.data.currentDetails,
              editMode: vm.data.isInEditMode,
              currentDate: vm.currentDate
            });
            modal.show();
          }, 300);
        });
      } else {
        $scope.$broadcast("timecard:addEditDetailsModal:open", {
          isFromPto: vm.data.isFromPto,
          details: vm.data.currentDetails,
          editMode: vm.data.isInEditMode,
          currentDate: vm.currentDate
        });
        vm.data.addEditDetailsModal.show();
      }
    }

    vm.data = {
      errors: [],
      calendar: {
        settings: {
          theme: "mobiscroll",
          display: "bottom",
          swipeDirection: "vertical"
        }
      },
      events: {
        onModalCancelClicked: function () {
          vm.data.isInEditMode = false;
          vm.data.isFromPto = false;
          vm.data.currentDetails = null;
          vm.data.addEditDetailsModal.hide();
        },
        onAddScheduleCompleted: function (__res) {
          if (vm.data.timeCards.length !== __res.timeCardDetails.length) {
            vm.data.approvalStatus = __res.timeCardSummary.approveStatus || 0;
          }
          __updateTimeCardBindings(__res);
          vm.data.addEditDetailsModal.hide();
        },
        addTimeClick: function (isFromPto) {
          $timeout(function () {
            vm.data.isFromPto = isFromPto;
            vm.data.isInEditMode = false;
            vm.data.currentDate = vm.currentDate;
            __showModal();
          }, 100);
          vm.popover.hide();
          return true;
        },
        showPopoverClicked: function ($event) {
          vm.popover.show($event);
        },
        clockOutClick: function (clockInDate, detail) {
          var notCheckInDetails = _.filter(vm.data.timeCards, function (tc) {
            return tc.finishTime === null && tc.jobCode !== __jobCodes.CLOCK_IN;
          });
          if (notCheckInDetails.length > 0) {
            alerts.confirm("Confirmation!", "You have a task pending to check out. \n\n Previously pending tasks will be checked out automattically. \n\n Are you sure?", function () {
              $timeout(function () {
                __processClockOutUser(clockInDate, detail);
              }, 10);
            });
          } else {
            alerts.confirm("Confirmation!", "Are you sure?", function () {
              $timeout(function () {
                __processClockOutUser(clockInDate, detail);
              }, 10);
            });
          }
        },
        clockInClick: function () {
          var tcDate = vm.currentDate;
          var smDt = new Date();
          var clockInTime = __toDateObj(new Date());
          var timeCardDate = __toDateObj(tcDate, smDt);
          vm.data.errors = [];
          var details = {
            startTime: __toDateString(clockInTime),
            jobCode: __jobCodes.CLOCK_IN,
            numFromSummary: vm.data.summary ? vm.data.summary.num : 0,
            timeCardDate: __toDateString(timeCardDate)
          };
          // ==========================================================
          // Checking User Schedule
          // ==========================================================

          if (!vm.assgiendToSameUser) {
            details.timecardUserEmailDefined = true;
            details.timecardUserEmail = __userEmail;
          }
          // ==========================================================
          // Sending Clockin Entry
          // ==========================================================
          fpmUtilitiesFactory.showLoading().then(function () {
            timecardFactory.clockInOutUser(details).then(function (response) {
              if (response.errors === null) {
                vm.data.clockInDateTime = clockInTime;
                vm.data.isClockedIn = true;
                vm.data.disableClockOutButton = false;
                vm.data.addTimeVisibility = true;
                vm.data.ptoButtonVisibility = false;
                alerts.alert("Clocked In", "Clocked in successfully", function () {
                  if (__havingPreRoute) {
                    $state.go($stateParams.proute);
                  } else {
                    __updateTimeCardBindings(response);
                  }
                });
              } else {
                vm.errors = response.errors;
              }
            }).finally(function () {
              fpmUtilitiesFactory.hideLoading();
            });
          });
        },
        onShowCalenderClick: function ($event) {
          if (angular.isDefined(vm.data.calendar.control)) {
            vm.data.calendar.control.show();
          }
        },
        onCurrentDateChanged: function () {
          $timeout(function () {
            __getUserTimeCardByDate();
          }, 100)
        }
      },
      loading: false,
      summary: null,
      isClockedIn: false,
      isClockedOut: false,
      clockInDateTime: new Date(),
      clockOutDateTime: new Date(),
      timecard: null,
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
      timeCardSummaryModal: null,
      currentDetails: null,
    };

    // ==========================================================
    // Getting Timecard Information for Schedule User
    // ==========================================================
    function __updateBindingsForSummaryStatus(details) {
      var anythingPending = _.where(details.timeCardDetails, {
        finishTime: null
      });
      if (anythingPending.length > 0 || vm.data.approvalStatus !== __statusTypes.NONE) {
        vm.data.allowSendForApproval = false;
        return false;
      }
      vm.data.allowSendForApproval = true;
      return true;
    }

    function __clearClockInData() {
      vm.data.allowSendForApproval = false;
      vm.data.summary = null;
      vm.data.approvalStatus = 0;
      vm.data.isClockedOut = false;
      vm.data.summary = null;
      vm.data.clockInDateTime = new Date();
      vm.data.isClockedIn = false;
      vm.data.addTimeVisibility = false;
      vm.data.clockedInDate = null;
      vm.data.timeCards = [];
      vm.data.disableClockInButton = false;
      vm.data.disableClockOutButton = false;
    }

    function __updateTimeCardBindings(details) {
      vm.data.timecard = details;
      vm.data.timeCards = details.timeCardDetails;
      vm.data.checkInOuts = _.filter(details.timeCardDetails, function (e) {
        return (e.jobCode !== __jobCodes.CLOCK_IN && e.jobCode !== __jobCodes.CLOCK_OUT)
      });
      vm.timecardAccessLevel = details.timecardAccessLevel;
      vm.data.summary = details.timeCardSummary;
      vm.data.currentClockedIn = _.findWhere(details.timeCardDetails, {
        jobCode: __jobCodes.CLOCK_IN,
        finishTime: null
      });
      if (details.timeCardSummary) {
        vm.data.approvalStatus = details.timeCardSummary.approveStatus || 0;
      }
      __updateBindingsForSummaryStatus(details);
      if (angular.isDefined(vm.data.currentClockedIn)) {
        var __clockIn = vm.data.currentClockedIn;
        vm.data.clockInDateTime = __toDate(__clockIn.startTime);
        vm.data.isClockedIn = true;
        vm.data.isClockedOut = __clockIn.finishTime !== null;
        vm.data.addTimeVisibility = !vm.data.isClockedOut;
        vm.data.clockOutDateTime = __toDate(__clockIn.finishTime);
        vm.data.clockedInDate = angular.copy(__clockIn);
      }
    }

    function __getUserTimeCardByDate() {
      var __dt = __toDateString(vm.currentDate);
      __clearClockInData();
      vm.showingLoading = true;
      vm.data.loading = true;
      timecardFactory.getTimeCardByDate(__dt, __userEmail).then(function (__res) {
        if (__res) {
          __updateTimeCardBindings(__res);
        }
      }).finally(function () {
        vm.data.loading = false;
        vm.showingLoading = false;
        fpmUtilitiesFactory.hideLoading();
      });
    }


    function __ensureScheduleNotAssgiendToCurrentUser(initLoad) {
      if (vm.schedule) {
        vm.assgiendToSameUser = vm.schedule && vm.schedule.technicianNum === vm.user.userEmail;
        vm.currentDate = __toDate(vm.schedule.scheduledStartDateTime);
        vm.userName = __isForWorkOrder ? vm.schedule.technicianName : vm.user.userName;
        if (!vm.assgiendToSameUser) {
          __userEmail = vm.schedule.technicianNum;
          $timeout(function () {
            __getUserTimeCardByDate()
          }, 50);
        }
      }
    }


    $scope.$watch("vm.data.timeCards", function (nw) {
      if (angular.isDefined(nw)) {
        __calculateTotalPayableTime();
      }
    }, true);

    vm.$onChanges = function () {
      $timeout(function () {
        __ensureScheduleNotAssgiendToCurrentUser(false);
      }, 100);
    }

    vm.$onInit = function () {
      vm.user = authenticationFactory.getLoggedInUserInfo();
      __isForWorkOrder = vm.basedOn === "workorder";
      vm.canChangeTimecardDate = vm.basedOn === "timecard";
      $timeout(function () {
        __ensureScheduleNotAssgiendToCurrentUser(true);
      }, 100);
    }

    $scope.$on("$timecard.refreshTimecard.pushToTimecard", function (evnt, args) {
      $timeout(function () {
        __ensureScheduleNotAssgiendToCurrentUser(false);
      }, 100);
    })

    $ionicPopover.fromTemplateUrl('timecard-popover.html', {
      scope: $scope
    }).then(function (popover) {
      vm.popover = popover;
    });
    $ionicModal.fromTemplateUrl("timecardDetailsModal.html", {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      vm.data.addEditDetailsModal = modal;
    });
  }

  // ==========================================================
  // as per basedOn string passed | we can changed the view type
  // ==========================================================
  var __componentConfig = {
    bindings: {
      basedOn: "@", // workorder | timecard
      schedule: "<",
    },
    controller: __detailController,
    controllerAs: "vm",
    templateUrl: "js/timecard/timecard.detail.component.html",
  };

  __detailController.$inject = ["$rootScope", "$scope", "$state", "$timeout", "work-orders-factory",
    "fpm-utilities-factory",
    "shared-data-factory",
    "authenticationFactory", "timecard-factory", "$ionicPopover", "$ionicModal", "$ionicActionSheet"
  ];

  angular.module("fpm").component("timecardDetails", __componentConfig);
})();
