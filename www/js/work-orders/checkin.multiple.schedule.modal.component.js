(function () {
  "use strict";

  function __componentController(
    $scope,
    $rootScope,
    $timeout,
    fpmUtilities,
    workOrdersFactory,
    timecardFactory
  ) {
    var vm = this;
    vm.selectedOption = 0;
    vm.showOtherSchedules = false;
    var jobStatus = {
      AcceptJob: 0,
      InRoute: 1,
      CheckIn: 2,
      CheckOut: 3,
    };
    vm.events = {
      onSubmitButtonClicked: function (multiple) {
        var __checkedSchedules = _.pluck(
          _.where(vm.schedules, { isChecked: true }),
          "num"
        );
        if (multiple && __checkedSchedules.length === 0) {
          return false;
        }
        if (vm.actionType === 3) {
          // ==========================================================
          // Clock-out
          // ==========================================================
          $scope.$emit("$wo.multipleScheduleModalCancel.clockout", {
            multiple: multiple,
            checkedSchedules: __checkedSchedules,
          });
        } else {
          var __actualStartDateTime = new Date();
          var __actualFinishDateTime = new Date();

          var __model = {
            scheduleButton:
              vm.actionType === 1
                ? jobStatus.CheckIn
                : vm.actionType === 2
                ? jobStatus.CheckOut
                : -1,
            scheduleNums: multiple ? __checkedSchedules : null,
            scheduleNum: !multiple ? vm.editedSchedule.num : null,
            actualEndTime:
              vm.actionType === 2
                ? fpmUtilities.toStringDate(__actualFinishDateTime)
                : null,
            actualStartTime: fpmUtilities.toStringDate(__actualStartDateTime),
            barcode: vm.barcode,
            timerStartAt: fpmUtilities.toStringDate(new Date()),
            clientTime: kendo.toString(new Date(), "g"),
          };
          fpmUtilities.showLoading().then(function () {
            workOrdersFactory
              .updateJobStatusMultiple(__model)
              .then(function (response) {
                if (response === null) {
                } else {
                }
              })
              .finally(function () {
                fpmUtilities.hideLoading();
                $rootScope.$broadcast(
                  "$wo.multipleScheduleModalCancel.reloadAll",
                  {
                    closeModal: true,
                  }
                );
              });
          });
        }
      },
      onSelectedOptionChanged: function () {
        $timeout(function () {
          vm.showOtherSchedules = vm.selectedOption === 1;
        }, 100);
      },
      closeProductEditModal: function () {
        $scope.$emit("$wo.multipleScheduleModalCancel");
      },
    };

    vm.$onInit = function () {
      $timeout(function () {
        workOrdersFactory
          .getSchedulesWithSameDateTime(
            vm.barcode,
            vm.editedSchedule.num,
            vm.actionType
          )
          .then(function (response) {
            vm.schedules = response;
            angular.forEach(vm.schedules, function (e) {
              e.isChecked = true;
            });
          });
      }, 20);
    };
  }

  __componentController.$inject = [
    "$scope",
    "$rootScope",
    "$timeout",
    "fpm-utilities-factory",
    "work-orders-factory",
    "timecard-factory",
  ];

  var __componentConfig = {
    bindings: {
      barcode: "<",
      editedSchedule: "<",
      actionType: "<",
    },
    controller: __componentController,
    controllerAs: "vm",
    templateUrl:
      "js/work-orders/checkin.multiple.schedule.modal.component.html",
  };

  angular
    .module("fpm")
    .component("checkinMultipleScheduleModalComponent", __componentConfig);
})();
