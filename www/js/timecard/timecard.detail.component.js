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
      approvalStatus: 0
    };

    // ==========================================================
    // Getting Timecard Information for Schedule User
    // ==========================================================

    function __updateTimeCardBindings(details) {
      vm.data.timecard = details;
      vm.data.currentClockedIn = _.findWhere(details.timeCardDetails, {
        jobCode: __jobCodes.CLOCK_IN,
        finishTime: null
      });
      if (details.timeCardSummary) {
        vm.data.approvalStatus = details.timeCardSummary.approveStatus || 0;
      }
    }

    function __getUserTimeCardByDate() {

      var __dt = __toDateString(vm.currentDate);
      timecardFactory.getTimeCardByDate(__dt, __userEmail).then(function (__res) {
        console.log(__res)
        if (__res) {
          __updateTimeCardBindings(__res);
        }
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
          __getUserTimeCardByDate();
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
