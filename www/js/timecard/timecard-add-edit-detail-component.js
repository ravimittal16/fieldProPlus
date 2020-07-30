(function () {
  "use strict";
  var componentConfig = {
    bindings: {
      onCancelClicked: "&",
      onAddCompleted: "&",
    },
    controller: ["$scope", "$timeout", "$q", "timecard-factory", "fpm-utilities-factory", "authenticationFactory",
      function ($scope, $timeout, $q, timecardFactory, fpmUtilitiesFactory, authenticationFactory) {
        var vm = this;
        var alerts = fpmUtilitiesFactory.alerts;
        var jobCodes = {
          CLOCK_IN: 5001,
          CLOCK_OUT: 5002
        };
        var isConfirmedBefore = false;
        vm.ui = {
          summary: angular.copy(timecardFactory.summary),
          jobCodes: [],
          workOrders: [],
          errors: [],
          isInvalidSave: false,
          ptoJobCodes: []
        };
        vm.dateTimeMode = {
          timeSpan: "",
          startTime: new Date(),
          finishTime: null,
          isCheckedIn: false,
          isCheckedOut: false
        };
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

          if (vm.isFromPto) {
            if (vm.entity.finishTime === null) {
              vm.ui.errors.push("Please select finish time.");
              return false;
            }
            var _st = kendo.parseDate(vm.entity.startTime);
            var _tcd = kendo.parseDate(vm.entity.timeCardDate);
            var s = moment(new Date(_st.getFullYear(), _st.getMonth(), _st.getDate(), 0, 0, 0, 0));
            var tcd = moment(new Date(_tcd.getFullYear(), _tcd.getMonth(), _tcd.getDate(), 0, 0, 0, 0));
            var tcd = moment(kendo.parseDate(vm.entity.timeCardDate));
            var dayDiff = moment(s).diff(tcd, "day");
            if (dayDiff < 0 || dayDiff > 1) {
              vm.ui.errors.push("Invalid Date");
              return false;
            }
          }
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
            // if (!vm.isFromPto) {
            //   if (!vm.editMode && ft.isAfter(tcd)) {
            //     vm.ui.errors.push("Cannot be a future time");
            //     return false;
            //   }
            // }
          }
          var _e = angular.copy(vm.entity)
          _e.startTime = kendo.toString(kendo.parseDate(vm.entity.startTime), "g");
          _e.finishTime = kendo.toString(kendo.parseDate(vm.entity.finishTime), "g");
          if (vm.entity.timeCardDate) {
            _e.timeCardDate = kendo.toString(vm.entity.timeCardDate, "g");
          }
          if (_e.jobCode === null || _e.jobCode === 0) {
            vm.ui.errors.push("Please select Job code before save");
            return false;
          }
          fpmUtilitiesFactory.showLoading().then(function () {
            var action = vm.isFromPto ? timecardFactory.addPtoDetails : timecardFactory.addNewDetails;
            action(_e).then(function (response) {
              isConfirmedBefore = false;
              if (angular.isArray(response.errors) && response.errors.length > 0) {
                vm.ui.errors = response.errors;
              } else {
                alerts.alert("Time Added", "Time has been " + (vm.editMode ? "updated" : "added"), function () {
                  if (angular.isFunction(vm.onAddCompleted)) {
                    vm.onAddCompleted({
                      o: response
                    });
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
              var notCheckInDetails = _.filter(allDetails, function (tc) {
                return tc.finishTime === null && tc.jobCode !== jobCodes.CLOCK_IN;
              });
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
          $timeout(function () {
            // var summary = timecardFactory.summary;
            // var st = vm.dateTimeMode.startTime;
            // var smDt = kendo.parseDate(summary.timeCardDate);
            //OLD
            // vm.entity.startTime = new Date(smDt.getFullYear(), smDt.getMonth(), smDt.getDate(), st.getHours(), st.getMinutes(), 0, 0);
            vm.entity.startTime = vm.dateTimeMode.startTime;
            _findTimeDiff();
          }, 100);
        }

        function onFinishDateTimeChaged() {
          $timeout(function () {
            //  var summary = timecardFactory.summary;
            if (vm.entity && vm.entity.startTime === null) {
              onDateTimeChaged();
            }
            // var ft = kendo.parseDate(vm.dateTimeMode.finishTime);
            // var smDt = kendo.parseDate(summary.timeCardDate);
            vm.entity.finishTime = vm.dateTimeMode.finishTime; //new Date(smDt.getFullYear(), smDt.getMonth(), smDt.getDate(), ft.getHours(), ft.getMinutes(), 0, 0);
            _findTimeDiff();
          }, 100);
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
        var selectedDate = new Date();

        function initController(eventParams) {
          vm.ui.errors = [];
          selectedDate = eventParams.currentDate || new Date();
          vm.details = eventParams.details;
          vm.editMode = eventParams.editMode;
          vm.isInEditMode = vm.editMode;

          var fromPto = eventParams.isFromPto;
          vm.isFromPto = fromPto;
          if (vm.editMode && vm.details) {
            vm.entity = angular.copy(vm.details);
            vm.entity.startTime = kendo.parseDate(vm.details.startTime);
            vm.entity.finishTime = kendo.parseDate(vm.details.finishTime);
            vm.entity.timeCardDate = kendo.parseDate(vm.details.timeCardDate);
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
            if (eventParams && eventParams.currentDate) {
              vm.entity.timeCardDate = eventParams.currentDate;
              selectedDate = eventParams.currentDate;
            }
            if (fromPto === true) {
              setInitialStartDateForPto();
            }
          }
          if (timecardFactory.summary && timecardFactory.summary.timeCardDate) {
            vm.entity.numFromSummary = timecardFactory.summary.num;
            vm.entity.timeCardDate = kendo.parseDate(timecardFactory.summary.timeCardDate);
          }
          vm.timecardPermissions.isFromAddingPto = fromPto;
          if (fromPto) {
            vm.timecardPermissions.timePickerVisibility = fromPto;
          }
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
              } else if (totalMintues < 0) {
                vm.dateTimeMode.timeSpan = "";
                vm.ui.isInvalidSave = true;
                defer.resolve(false);
              } else {
                if (!vm.isInEditMode) {
                  // vm.entity.finishTime = new Date();
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
              vm.ui.jobCodes = _.where(response, {
                isPtoType: false
              });;
              vm.ui.ptoJobCodes = _.where(response, {
                isPtoType: true
              });
            }).finally(fpmUtilitiesFactory.hideLoading);
          });
        }
        var eventCalled = false;
        vm.$onInit = function () {
          vm.userInfo = authenticationFactory.getLoggedInUserInfo();
          if (vm.userInfo) {
            vm.timecardPermissions.allowPushTime = vm.userInfo.allowPushTime;
            vm.timecardPermissions.timePickerVisibility = vm.userInfo.allowPushTime;
          }
        }
        $scope.$on("timecard:addEditDetailsModal:open", function ($event, params) {
          eventCalled = true;
          initController(params);
          $timeout(function () {
            _getOrders();
          }, 100);
        })
      }
    ],
    controllerAs: "vm",
    templateUrl: "js/timecard/timecard-add-edit-detail-component.template.html"
  };
  angular.module("fpm").component("addEditDetailsComponent", componentConfig);
})();
