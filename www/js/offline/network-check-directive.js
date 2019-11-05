(function () {
  "use strict"
  var fpm = angular.module("fpm");

  function _directiveController($scope, $timeout, $ionicPlatform, sqlStorageFactory) {
    var vm = this;
    vm.isConnectedToNetwork = true;

    vm._onNetworkConnectionChange = function (isConnected) {
      sqlStorageFactory.setNetworkConnectivity(isConnected);
      if (isConnected !== vm.isConnectedToNetwork) {
        vm.isConnectedToNetwork = isConnected;
        $timeout(function () {
          $scope.$broadcast("network:connection:changed", {
            isConnected: isConnected
          });
        }, 300);

      }
    }

    function onOffline() {
      $timeout(function () {
        vm._onNetworkConnectionChange(false);
      }, 500)
    }

    function onOnline() {
      $timeout(function () {
        vm._onNetworkConnectionChange(true);
      }, 500)
    }

    $ionicPlatform.ready(function () {
      document.addEventListener("offline", onOffline, false);
      document.addEventListener("online", onOnline, false);
    });

    vm.$onInit = function () {

    }
    vm.$onChanges = function () {}
  }
  _directiveController.$inject = ["$scope", "$timeout", "$ionicPlatform", "sqlStorageFactory"]
  fpm.directive("networkCheck", [function () {
    return {
      restrict: "A",
      controller: _directiveController,
      controllerAs: "vm"
    }
  }]);
})();
