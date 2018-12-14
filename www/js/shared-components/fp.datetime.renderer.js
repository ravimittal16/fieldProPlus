(function () {
  "use strict";
  angular.module("fpm").component("fpDateTimeRenderer", {
    controller: [
      "dateFilter",
      function (dateFilter) {
        var vm = this;
        vm.formattedValue = "";

        function renderFormattedValue() {
          if (vm.modelVal && !_.isDate(vm.modelVal)) {
            vm.modelVal = kendo.parseDate(vm.modelVal);
          }
          if (vm.modelVal && vm.modelVal !== "") {
            var formattedVal = "";
            if (vm.format && vm.format !== "") {
              vm.format =
                vm.type == "datetime" ? vm.format + " hh:mm a" : vm.format;
              formattedVal = dateFilter(vm.modelVal, vm.format);
            } else {
              vm.format =
                vm.type == "datetime" ? "MM/dd/yyyy hh:mm a" : vm.format;
              formattedVal = dateFilter(vm.modelVal, vm.format);
            }
            vm.formattedValue = formattedVal;
          }
        }

        vm.$onChanges = function () {
          renderFormattedValue();
        };

        vm.$onInit = function () {
          renderFormattedValue();
        };

        vm.$onDestroy = function () {};
      }
    ],
    template: '<span ng-bind="vm.formattedValue"></span>',
    controllerAs: "vm",
    bindings: {
      modelVal: "<",
      format: "<",
      type: "@"
    }
  });
})();
