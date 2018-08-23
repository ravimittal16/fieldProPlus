(function() {
  "use strict";
  angular.module("fpm").component("fpcurrencyRenderer", {
    controller: [
      "$filter",
      "$rootScope",
      "authenticationFactory",
      function($filter, $rootScope, authenticationFactory) {
        var vm = this;
        vm.currencyValue = "";
        function renderCurrency() {
          if (vm.modelVal) {
            vm.currencyValue = $filter("currency")(
              vm.modelVal,
              $rootScope.currencySymbol,
              2
            );
          } else {
            vm.currencyValue = $filter("currency")(
              0,
              $rootScope.currencySymbol,
              2
            );
          }
        }

        function _renderFormattedValue() {
          if ($rootScope.currencySymbol) {
            renderCurrency();
          } else {
            var user = authenticationFactory.getLoggedInUserInfo();
            if (user.currencySymbol) {
              $rootScope.currencySymbol = user.currencySymbol;
              renderCurrency();
            } else {
              $rootScope.currencySymbol = "$";
              renderCurrency();
            }
          }
        }

        vm.$onChanges = function() {
          renderCurrency();
        };

        vm.$onInit = function() {
          _renderFormattedValue();
        };

        vm.$onDestroy = function() {};
      }
    ],
    template: '<span ng-bind="vm.currencyValue"></span>',
    controllerAs: "vm",
    bindings: {
      modelVal: "<"
    }
  });
})();
