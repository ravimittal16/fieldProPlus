(function () {
  "use strict";
  angular.module("fpm").component("workorderViewComponent", {
    bindings: {
      odr: "<",
      trackJobStatus: "<",
      userInfo: "<",
      inRouteClicked: "&"
    },
    controller: ["$state", "$rootScope", "fpm-utilities-factory", "sqlStorageFactory", "work-orders-factory",
      function ($state, $rootScope, fpmUtilitiesFactory, sqlStorageFactory, workOrdersFactory) {
        var scheduleButtons = {
          AcceptJob: 0,
          InRoute: 1,
          CheckIn: 3,
          CheckOut: 4
        };
        var vm = this;
        vm.events = {
          saveOrderRefOffline: function () {
            fpmUtilitiesFactory.alerts.confirm("Confirmation!", "Are you sure?", function () {
              var _barcode = vm.odr.Barcode;
              var _scheduleNum = vm.odr.TechnicianScheduleNum;
              sqlStorageFactory.insertWorkOrderRef({
                barcode: _barcode,
                scheduleNum: _scheduleNum,
                userName: vm.userInfo.userEmail,
                jsonPayload: JSON.stringify(vm.odr)
              }).then(function (id) {
                if (id !== 0 & id !== -1) {
                  $rootScope.$broadcast("$offline:newOrderSaved", {
                    barcode: _barcode
                  });
                  fpmUtilitiesFactory.alerts.alert("Success!", "Work order saved.", function () {
                    fpmUtilitiesFactory.showLoading().then(function () {
                      workOrdersFactory
                        .getBarcodeDetails(_barcode)
                        .then(
                          function (response) {
                            if (response) {
                              sqlStorageFactory.insertWorkOrderInfo(response, _scheduleNum);
                            }
                          }).finally(function () {
                          fpmUtilitiesFactory.hideLoading();
                        });
                    });
                  });
                  //TODO : Download the work order details

                }
                if (id === -1) {
                  fpmUtilitiesFactory.alerts.alert("Warning", "This work order already saved.", function () {
                    fpmUtilitiesFactory.hideLoading();
                  });
                }

              });
            });
          },
          acceptJob: function () {
            fpmUtilitiesFactory.alerts.confirm("Confirmation!", "Are you sure you want to accept this job?", function () {
              fpmUtilitiesFactory.showLoading().then(function () {
                workOrdersFactory.updateJobStatus({
                  scheduleButton: scheduleButtons.AcceptJob,
                  scheduleNum: vm.odr.TechnicianScheduleNum
                }).then(function () {
                  vm.odr.JobAcceptanceStatus = true;
                }).finally(fpmUtilitiesFactory.hideLoading);
              });
            });
          },
          inRouteClicked: function () {
            if (angular.isFunction(vm.inRouteClicked)) {
              vm.inRouteClicked({
                odr: vm.odr
              });
            }
          },
          onOrderClicked: function () {
            if (vm.odr) {
              $state.go("app.editOrder", {
                barCode: vm.odr.Barcode,
                technicianNum: vm.odr.TechnicianScheduleNum,
                src: "main"
              });
            }
          }
        };
        vm.$onInit = function () {}
      }
    ],
    controllerAs: "vm",
    templateUrl: "js/dashboard/workorder-view-component-template.html"
  });
})();
