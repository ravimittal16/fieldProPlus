(function () {
  "use strict";

  function __detailController($rootScope, $scope, $state, $timeout, workOrdersFactory,
    fpmUtilitiesFactory, sharedDataFactory, authenticationFactory, timecardFactory) {
    var vm = this;
    var __jobCodes = timecardFactory.statics.jobCodes;
    var __statusTypes = timecardFactory.statics.statusTypes;
    var __toDateString = fpmUtilitiesFactory.toStringDate;
    var __isForWorkOrder = false;
    var __userEmail = "";
    vm.assgiendToSameUser = false;
    vm.currentDate = new Date();
    vm.dateFormat = $rootScope.dateFormat;


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
      instance: null,
    };

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
      timecard: null,
      currentClockedIn: null,
      approvalStatus: 0,
      allowSendForApproval: false,
      summary: null,
      clockInDateTime: new Date()
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
        var __clockIn = vm.ui.data.currentClockedIn;
        vm.data.clockInDateTime = __toDate(__clockIn.startTime);
        vm.data.isClockedIn = true;
        vm.data.isClockedOut = clockIn.finishTime !== null;
        vm.data.addTimeVisibility = !vm.data.isClockedOut;
        vm.data.clockOutDateTime = __toDate(clockIn.finishTime);
        vm.data.clockedInDate = angular.copy(clockIn);
      }
    }

    function __getUserTimeCardByDate() {

      var __dt = __toDateString(vm.currentDate);
      __clearClockInData();
      vm.showingLoading = true;
      timecardFactory.getTimeCardByDate(__dt, __userEmail).then(function (__res) {
        console.log(__res)
        if (__res) {
          __updateTimeCardBindings(__res);
        }
      }).finally(function () {
        vm.showingLoading = false;
        fpmUtilitiesFactory.hideLoading();
      });
    }

    function __toDate(dateString) {
      return kendo.parseDate(dateString);
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
