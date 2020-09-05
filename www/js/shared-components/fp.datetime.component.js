(function () {
  "use strict";
  angular.module("fpm").component("fpDateTimeComponent", {
    controller: [
      "$timeout",
      "$rootScope",
      function ($timeout, $rootScope) {
        var vm = this;
        vm.format = $rootScope.dateFormat;
        vm.disableSelection = false;

        function setCalendarConfiguration() {
          vm.mobiscrollDateTimeConfig = {
            instance: null,
            display: "bottom",
            dateFormat: vm.format !== undefined && vm.format !== "" ?
              vm.format.toLowerCase().replace("yy", "") : "mm/dd/yy",
            timeFormat: "hh:ii A",
            onSelect: function (e) {
              if (angular.isFunction(vm.onDateChanged)) {
                $timeout(function () {
                  vm.onDateChanged();
                }, 100);
              }
            }
          };
        }

        vm.onInputboxTapped = function () {

        }

        vm.$onChanges = function (e, r) {
          setCalendarConfiguration();
        };

        vm.$onInit = function () {
          if (vm.modelVal && !_.isDate(vm.modelVal)) {
            vm.modelVal = new Date(vm.modelVal);
          }
          setCalendarConfiguration();
        };

        vm.$onDestroy = function () {};
      }
    ],
    template: '<input type="text" ng-if="!vm.isDisabled" on-tap="vm.onInputboxTapped()"  class="transparent-background" mobiscroll-datetime="vm.mobiscrollDateTimeConfig" ng-model="vm.modelVal" placeholder="{{vm.defaultText}}" /> <input type="text" ng-if="vm.isDisabled" readonly disabled on-tap="vm.onInputboxTapped()"  class="transparent-background" placeholder="{{vm.defaultText}}" />',
    controllerAs: "vm",
    bindings: {
      modelVal: "=",
      type: "@",
      onDateChanged: "&",
      format: "<",
      defaultText: "@",
      isDisabled: "<"
    }
  });
})();
