(function () {
  "use strict";
  var componentConfig = {
    bindings: {
      barcode: "<",
      totalAmountDue: "<",
    },
    templateUrl: "js/work-orders/order-payment-component.template.html",
    controller: ["$scope", "$state", "$stateParams", "authenticationFactory", "work-orders-factory", "fieldPromaxConfig", "fpm-utilities-factory", "$timeout",
      function ($scope, $state, $stateParams, authenticationFactory, workOrderFactory, fieldPromaxConfig, fpmUtilities, $timeout) {
        var vm = this;
        var baseUrl = fieldPromaxConfig.fieldPromaxApi;
        var user = authenticationFactory.getLoggedInUserInfo();
        vm.showList = false;
        vm.paymentModal = null;
        var alerts = fpmUtilities.alerts;
        var paymentSchema = {
          paymentMode: "",
          receivedDate: new Date(),
          barCode: vm.barcode,
          paymentMemo: "",
          amountReceived: 0.00,
          serviceProviderEmail: ""
        };

        function calculateBalanceDue() {
          var amountReceived = 0;
          var totalAmountDue = vm.totalAmountDue.toFixed(2);
          angular.forEach(vm.payments, function (p, i) {
            amountReceived += parseFloat(p.amountReceived);
          });

          vm.amountReceived = amountReceived;
          vm.balanceDue = totalAmountDue - amountReceived;
        }

        function getBarcodePayments() {
          workOrderFactory
            .getBarcodePayments(vm.barcode)
            .then(
              function (response) {
                if (response != null) {
                  vm.showList = true;
                  vm.payments = angular.copy(response);
                } else {
                  vm.showList = false;
                }
                calculateBalanceDue();
              });
        }

        function openAddEditPaymentModal() {
          vm.modalType = 1;
          vm.currentPayment = angular.copy(paymentSchema);
          if (vm.paymentModal) {
            vm.paymentModal.show();
          } else if (vm.balanceDue > 0) {
            fpmUtilities
              .getModal("addEditPaymentModal.html", $scope)
              .then(function (modal) {
                vm.addEditPaymentModal = modal;
                vm.addEditPaymentModal.show();
              });
          } else {
            alerts.alert("Alert", "There is no amount to charge against this work order.", function () {
              return false;
            });
          }
        }
        $scope.$on("$fpm:closeAddEditPaymentModal", function () {
          if (vm.addEditPaymentModal) {
            vm.addEditPaymentModal.hide();
          }
        });

        $scope.$watch("vm.totalAmountDue", function (n, o) {
          calculateBalanceDue();
        });

        $scope.$on("$fpm:addUpdatePaymentCompleted", function (event, data) {
          vm.payments = angular.copy(data.o.payments);
          if (data.o.payment.num == undefined) {
            alerts.alert(
              "Success",
              "Payment added successfully",
              function () {
                $timeout(function () {
                  vm.showList = true;
                  calculateBalanceDue();
                }, 50);
              }
            );
          } else {
            alerts.alert(
              "Success",
              "Payment updated successfully",
              function () {
                $timeout(function () {
                  vm.showList = true;
                  calculateBalanceDue();
                }, 50);
              }
            );
          }
          vm.addEditPaymentModal.hide();
        });
        vm.events = {
          collectPaymentClicked: function () {
            if (vm.balanceDue > 0) {
              $state.go('app.checkout', {
                amount: vm.balanceDue,
                barcode: vm.barcode,
                technicianNum: $stateParams.technicianNum
              });
            } else {
              alerts.alert("Alert", "There is no amount to charge against this work order.", function () {
                return false;
              });
            }
          },
          addEditPayment: function () {
            openAddEditPaymentModal();
          },
          onEditPaymentClicked: function (pmt) {
            vm.modalType = 0;
            vm.currentPayment = angular.copy(pmt);
            vm.currentPayment.receivedDate = kendo.parseDate(pmt.receivedDate);
            if (vm.paymentModal) {
              vm.paymentModal.show();
            } else {
              fpmUtilities
                .getModal("addEditPaymentModal.html", $scope)
                .then(function (modal) {
                  vm.addEditPaymentModal = modal;
                  vm.addEditPaymentModal.show();
                });
            }
          },
          onDeletePaymentClicked: function (pmt) {
            alerts.confirmDelete(function () {
              workOrderFactory
                .deletePayment(pmt.num)
                .then(function (response) {
                  if (response) {
                    vm.payments = response;
                  }
                  calculateBalanceDue();
                });
            });
          }


        }


        vm.$onInit = function () {
          getBarcodePayments();
        }
      }
    ],
    controllerAs: "vm"
  };
  angular.module("fpm").component("orderPaymentComponent", componentConfig);
})();
