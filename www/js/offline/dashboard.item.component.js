(function () {
  "use strict";
  var componentConfig = {
    controllerAs: "vm",
    templateUrl: "js/offline/dashboard.item.component.html",
    controller: ["$scope", "$state", "$timeout", "fpm-utilities-factory", "sqlStorageFactory", "authenticationFactory", "fieldPromaxConfig",
      function ($scope, $state, $timeout, fpmUtilitiesFactory, sqlStorageFactory, authenticationFactory, fieldPromaxConfig) {
        var vm = this;
        vm.itemCount = 0;
        vm.isOpened = false;
        var userInfo = null;
        var _sqlResponse;
        var devEnv = fieldPromaxConfig.devEnv;
        vm.savedItemsArray = [];
        var alerts = fpmUtilitiesFactory.alerts;
        vm.events = {
          syncChanges: function (odr) {},
          goToOfflineOrder: function (odr) {
            if (odr) {
              $state.go("app.editOrderOffline", {
                barCode: odr.Barcode,
                technicianNum: odr.TechnicianScheduleNum,
                src: "dashboard"
              });
            }
          },
          deleteOrder: function (odr) {
            fpmUtilitiesFactory.alerts.confirm("Confirmation!", "Are you sure?", function () {
              sqlStorageFactory.deleteOrder(odr.Barcode, odr.TechnicianScheduleNum).then(function (res) {
                _getOfflineSavedOrders(true);
              });
            });
          }
        };

        function _getOfflineSavedOrders(fromDelete) {
          vm.itemCount = 0;
          vm.savedItemsArray = [];
          try {
            sqlStorageFactory.getSavedOrdersByUser(userInfo.userEmail).then(function (response) {
              if (response) {
                vm.itemCount = response.length;
                if (fromDelete && response.length === 0) {
                  vm.isOpened = false;
                }
                _sqlResponse = response;

                if (response.length > 0) {
                  var arr = [];
                  for (var i = 0; i < response.length; i++) {
                    if (devEnv) {
                      arr.push(JSON.parse(response[i].jsonPayload));
                    } else {
                      arr.push(JSON.parse(response.item(i).jsonPayload));
                    }
                    if (i === response.length - 1) {
                      $timeout(function () {
                        vm.savedItemsArray = arr;
                      }, 10)
                    }
                  }
                }
              }
            });
          } catch (e) {
            alerts.alert(e);
          }
        }
        $scope.$on("$offline:newOrderSaved", function (evt, args) {
          vm.isOpened = false;
          _getOfflineSavedOrders(false);
        });

        vm.$onInit = function () {
          userInfo = authenticationFactory.getLoggedInUserInfo();
          _getOfflineSavedOrders(false);
        }
      }
    ]
  };
  angular.module("fpm").component('offlineItem', componentConfig);
})();
