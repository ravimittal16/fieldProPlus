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
        function renderCurrency(symbol) {
          if (vm.modelVal) {
            vm.currencyValue = $filter("currency")(
              vm.modelVal,
              $rootScope.currencySymbol,
              2
            );
          }
        }
        vm.$onInit = function() {
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
        };
      }
    ],
    template: '<span ng-bind="vm.currencyValue"></span>',
    controllerAs: "vm",
    bindings: {
      modelVal: "<"
    }
  });
})();
