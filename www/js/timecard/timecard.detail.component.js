(function () {
  "use strict";

  function __detailController($rootScope, $scope, $state, $timeout, workOrdersFactory,
    fpmUtilitiesFactory, sharedDataFactory, authenticationFactory, timecardFactory) {
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

    function _processClockOutUser(clockInDateTime, __details) {

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
      vm.data.timeCards = details;
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
        console.log(__res);
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



    vm.$onChanges = function () {
      $timeout(function () {
        __ensureScheduleNotAssgiendToCurrentUser(false);
      }, 100);
    }

    vm.$onInit = function () {
      vm.user = authenticationFactory.getLoggedInUserInfo();
      __isForWorkOrder = vm.basedOn === "workorder";
      $timeout(function () {
        __ensureScheduleNotAssgiendToCurrentUser(true);
      }, 100);
    }
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
    "authenticationFactory", "timecard-factory"
  ];

  angular.module("fpm").component("timecardDetails", __componentConfig);
})();
