(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            barcode: "<",
            payment: "=",
            modalType: "<",
            amountReceived: "=",
            balanceDue: "="
        },
        controller: [
            "$scope",
            "fpm-utilities-factory",
            "work-orders-factory",
            "authenticationFactory",
            "$rootScope",
            function (
                $scope,
                fpmUtilitiesFactory,
                workOrdersFactory,
                authenticationFactory,
                $rootScope
            ) {
                var vm = this;
                vm.errors = [];
                vm.paymentModes = [
                    { name: "Cash", value: "Cash" },
                    { name: "Credit Card", value: "Credit Card" },
                    { name: "Cheque", value: "Cheque" }
                ];

                vm.events = {
                    closePaymentModal: function () {
                        $rootScope.$broadcast("$fpm:closeAddEditPaymentModal");
                    },
                    submit: function () {
                        vm.errors = [];
                        vm.showError = false;
                        vm.payment.serviceProviderEmail = vm.user.userEmail;
                        if (vm.payment.num == undefined) {
                            if (
                                vm.payment.amountReceived >
                                vm.balanceDue.toFixed(2)
                            ) {
                                vm.errors.push(
                                    "Amount received can not be more than balance due."
                                );
                                vm.showError = true;
                                return false;
                            }
                            if (vm.payment.paymentMode == "") {
                                vm.errors.push("Please select a payment mode.");
                                vm.showError = true;
                                return false;
                            }
                            if (vm.payment.amountReceived == 0) {
                                vm.errors.push(
                                    "Payment amount can not be zero"
                                );
                                vm.showError = true;
                                return false;
                            }
                        } else {
                            // if((parseFloat(vm.payment.amountReceived) + parseFloat(vm.amountReceived)) > vm.balanceDue.toFixed(2) )
                            // {
                            //     vm.errors.push("Amount received can not be more than balance due");
                            //     vm.showError = true;
                            //     return false;
                            // }
                        }
                        fpmUtilitiesFactory.showLoading().then(function () {
                            workOrdersFactory
                                .addUpdatePayment(vm.payment)
                                .then(function (response) {
                                    if (response == null) {
                                        vm.errors = response.model.errors;
                                        vm.showError = true;
                                    } else {
                                        $rootScope.$broadcast(
                                            "$fpm:addUpdatePaymentCompleted",
                                            {
                                                o: {
                                                    payment: vm.payment,
                                                    payments: response
                                                }
                                            }
                                        );
                                    }
                                })
                                .finally(fpmUtilitiesFactory.hideLoading);
                        });
                    }
                };

                vm.$onInit = function () {
                    vm.user = authenticationFactory.getLoggedInUserInfo();
                };
            }
        ],
        controllerAs: "vm",
        templateUrl:
            "js/work-orders/add-edit-payment-modal-component.template.html"
    };
    angular.module("fpm").component("addEditPaymentComponent", componentConfig);
})();
