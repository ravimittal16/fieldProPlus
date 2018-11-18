(function() {
  "use strict";
  angular.module("fpm").component("fpDateTimeComponent", {
    controller: [
      "$timeout",
      "$rootScope",
      function($timeout, $rootScope) {
        var vm = this;
        vm.format = $rootScope.dateFormat;
        function setCalendarConfiguration() {
          vm.mobiscrollDateTimeConfig = {
            display: "bottom",
            dateFormat:
              vm.format !== undefined && vm.format !== ""
                ? vm.format.toLowerCase().replace("yy", "")
                : "mm/dd/yy",
            timeFormat: "hh:ii A",
            onSelect: function(e) {
              if (angular.isFunction(vm.onDateChanged)) {
                $timeout(function() {
                  vm.onDateChanged();
                }, 100);
              }
            }
          };
        }

        vm.$onChanges = function() {
          setCalendarConfiguration();
        };

        vm.$onInit = function() {
          if (vm.modelVal && !_.isDate(vm.modelVal)) {
            vm.modelVal = new Date(vm.modelVal);
          }
          setCalendarConfiguration();
        };

        vm.$onDestroy = function() {};
      }
    ],
    template:
      '<input type="text" class="transparent-background" mobiscroll-datetime="vm.mobiscrollDateTimeConfig" ng-model="vm.modelVal" placeholder="{{vm.defaultText}}" />',
    controllerAs: "vm",
    bindings: {
      modelVal: "=",
      type: "@",
      onDateChanged: "&",
      format: "<",
      defaultText: "@"
    }
  });
})();
