(function () {
  "use strict";

  function __componentController(
    $scope,
    $rootScope,
    $timeout,
    fpmUtilitiesFactory,
    workOrdersFactory,
    authenticationFactory
  ) {
    var vm = this;
    vm.selectedOption = 0;
    vm.showOtherSchedules = false;
    vm.events = {
      onSelectedOptionChanged: function () {
        $timeout(function () {
          vm.showOtherSchedules = vm.selectedOption === 1;
        }, 100);
      },
      closeProductEditModal: function () {
        $scope.$emit("$wo.multipleScheduleModalCancel");
      },
    };

    vm.$onInit = function () {};
  }

  __componentController.$inject = [
    "$scope",
    "$rootScope",
    "$timeout",
    "fpm-utilities-factory",
    "work-orders-factory",
    "authenticationFactory",
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
