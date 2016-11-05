(function () {
  "use strict";

  function initController($scope, $state, workOrderFactory) {
    var vm = this;

    function activateController() {
        
    }
    activateController();
  }
  initController.$inject = ["$scope", "$state", "work-orders-factory"];
  angular.module("fpm").controller("create-order-controller", initController);
})();
