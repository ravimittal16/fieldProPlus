(function () {
  "use strict";

  function initController($scope) {
    var vm = this;
    vm.byProducts = true;
    vm.byContainers = false;
    vm.events = {
      showContainersView: function () {
        vm.byProducts = false;
        vm.byContainers = true;
      },
      showProductsView: function () {
        vm.byProducts = true;
        vm.byContainers = false;
      }
    }
  }
  initController.$inject = ["$scope"];
  angular.module("fpm").controller("inventory-controller", initController);
})();
