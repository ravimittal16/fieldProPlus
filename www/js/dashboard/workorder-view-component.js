(function () {
  "use strict";
  angular.module("fpm").component("workorderViewComponent", {
    bindings: {
      odr: "<",
      trackJobStatus: "<",
      userInfo: "<",
      inRouteClicked: "&",
      index: "<"
    },
    controller: ["$scope", "$state", "$rootScope", "fpm-utilities-factory", "authenticationFactory", "sqlStorageFactory", "work-orders-factory", "dashboard-factory",
      function ($scope, $state, $rootScope, fpmUtilitiesFactory, authenticationFactory, sqlStorageFactory, workOrdersFactory, dashboardFactory) {
        var scheduleButtons = {
          AcceptJob: 0,
          InRoute: 1,
          CheckIn: 3,
          CheckOut: 4
        };
        var vm = this;
        vm.userInfo = authenticationFactory.getLoggedInUserInfo();
        vm.scheduleEditModal = null;
        vm.allowedForSp = false;
        vm.events = {
          onModalCancelClicked: function () {
            vm.scheduleEditModal.hide();
          },
          onEditCompleted: function (isDone) {
            fpmUtilitiesFactory.alerts.alert("Success!", "Schedule has been updated successfully.", function () {
              vm.scheduleEditModal.hide();
              $scope.$emit("$fpm:scheduleChanged", {
                scheduleId: vm.odr.TechnicianScheduleNum
              });
            })
          },
          onEditButtonClicked: function () {
            fpmUtilitiesFactory.showLoading().then(function () {
              workOrdersFactory.getScheduleById(vm.odr.TechnicianScheduleNum).then(function (response) {
                if (response && response.schedule) {
                  if (response.schedule.workComplete) {
                    fpmUtilitiesFactory.alerts.alert("Warning!", "Schedule has been marked as completed.", function () {
                      vm.odr.workComplete = response.schedule.workComplete;
                    });
                  } else {
                    vm.schedule = response.schedule;
                    if (vm.scheduleEditModal === null) {
                      fpmUtilitiesFactory
                        .getModal("editScheduleModal.html", $scope)
                        .then(function (modal) {
                          vm.scheduleEditModal = modal;
                          vm.scheduleEditModal.show();
                        });
                    } else {
                      vm.scheduleEditModal.show();
                    }
                  }
                }
              }).finally(function () {
                fpmUtilitiesFactory.hideLoading();
              });
            });
          },
          onDeleteButtonClicked: function () {
            fpmUtilitiesFactory.alerts.confirm(
              "Confirmation",
              "Are you sure you want to delete the schedule?",
              function () {
                //TechnicianScheduleNum
                fpmUtilitiesFactory.showLoading().then(function () {
                  workOrdersFactory.deleteSchedule(vm.odr.TechnicianScheduleNum).then(function (response) {
                    if (response && response.success) {
                      fpmUtilitiesFactory.alerts.alert("Success!", "Schedule has been deleted.", function () {
                        $scope.$emit("$fpm:scheduleChanged", {
                          scheduleId: vm.odr.TechnicianScheduleNum
                        });
                      });
                    }
                  }).finally(function () {
                    fpmUtilitiesFactory.hideLoading();
                  });
                });
              });
          },
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
        vm.$onInit = function () {
          vm.serviceProviders = dashboardFactory.serviceProviders;
          vm.allowedForSp = dashboardFactory.isServiceProvider && dashboardFactory.showEditDeleteForServiceProvider;
        }
      }
    ],

    controllerAs: "vm",
    templateUrl: "js/dashboard/workorder-view-component-template.html"
  });
})();
