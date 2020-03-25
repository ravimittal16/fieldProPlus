(function () {
  "use strict";
  var componentConfig = {
    bindings: {
      barcode: "<",
      onCancelClicked: "&",
      onAddCompleted: "&",
      serviceProviders: "<",
      onEditOpCompleted: "&",
      isForEdit: "<",
      editedSchedule: "<"
    },
    controller: [
      "$scope",
      "$rootScope",
      "$timeout",
      "fpm-utilities-factory",
      "work-orders-factory",
      "authenticationFactory",
      function (
        $scope,
        $rootScope,
        $timeout,
        fpmUtilitiesFactory,
        workOrdersFactory,
        authenticationFactory
      ) {
        var vm = this;
        vm.errors = [];
        vm.dateTimeFormat = $rootScope.dateFormat;
        //vm.user = authenticationFactory.getLoggedInUserInfo();
        var scheduleSchema = {
          serviceProvider: "",
          startDate: new Date(),
          endTime: new Date(),
          fromMobile: true,
          barCode: vm.barcode,
          intuitQboItemId: ""
        };
        //updateSchedule2
        vm.newSchedule = angular.copy(scheduleSchema);
        vm.events = {
          closeProductEditModal: function () {
            if (angular.isFunction(vm.onCancelClicked)) {
              vm.onCancelClicked();
            }
          },
          addScheduleClicked: function () {
            vm.errors = [];
            vm.showError = false;
            var schedule = angular.copy(vm.newSchedule);
            schedule.startDate = fpmUtilitiesFactory.toStringDate(
              vm.newSchedule.startDate
            );
            schedule.endTime = fpmUtilitiesFactory.toStringDate(
              vm.newSchedule.endTime
            );
            if (vm.isForEdit) {
              schedule = angular.copy(vm.editedSchedule);
              schedule.technicianNum = vm.newSchedule.serviceProvider;
              schedule.scheduledStartDateTime = fpmUtilitiesFactory.toStringDate(
                vm.newSchedule.startDate
              );;
              schedule.scheduledFinishDateTime = fpmUtilitiesFactory.toStringDate(
                vm.newSchedule.endTime
              );
            }
            fpmUtilitiesFactory.showLoading().then(function () {
              var _promise = vm.isForEdit ? workOrdersFactory.updateSchedule2 : workOrdersFactory.addWorkOrderSchedule;
              _promise(schedule)
                .then(function (response) {
                  if (
                    angular.isDefined(response.model) &&
                    angular.isArray(response.model.errors) &&
                    response.model.errors.length > 0
                  ) {
                    vm.errors = response.model.errors;
                    vm.showError = true;
                  } else {
                    if (angular.isFunction(vm.onAddCompleted) && !vm.isForEdit) {
                      vm.onAddCompleted({
                        o: {
                          invoice: response.invoice,
                          schedules: response.schedule
                        }
                      });
                    }
                    if (angular.isFunction(vm.onEditOpCompleted) && vm.isForEdit) {
                      vm.onEditOpCompleted({
                        isDone: true
                      });
                    }
                  }
                })
                .finally(fpmUtilitiesFactory.hideLoading);
            });
          },
          onServiceProviderSelectionChanged: function () {}
        };

        vm.$onInit = function () {

          vm.user = authenticationFactory.getLoggedInUserInfo();
          //$timeout(function() {
          vm.dateTimeFormat = vm.user.dateFormat;
          //}, 100);

          if (vm.isForEdit && vm.editedSchedule) {
            $timeout(function () {
              vm.newSchedule.serviceProvider = vm.editedSchedule.technicianNum;
              vm.newSchedule.startDate = kendo.parseDate(vm.editedSchedule.scheduledStartDateTime);
              vm.newSchedule.endTime = kendo.parseDate(vm.editedSchedule.scheduledFinishDateTime);
              vm.newSchedule.num = vm.editedSchedule.num;
              vm.newSchedule.barCode = vm.editedSchedule.barcode;
            }, 50)
          }
        };
      }
    ],
    controllerAs: "vm",
    templateUrl: "js/work-orders/add-schedule-modal-component.template.html"
  };
  angular.module("fpm").component("addScheduleModalComponent", componentConfig);
})();
