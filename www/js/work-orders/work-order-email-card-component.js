(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            barcode: "<",
            taxrate: "<",
            defaultEmails: "<"
        },
        templateUrl: "js/work-orders/work-order-email-card-template.html",
        controller: ["$scope", "$ionicActionSheet", "$q", "work-orders-factory", "fpm-utilities-factory",
            function ($scope, $ionicActionSheet, $q, workOrdersFactory, fpmUtilitiesFactory) {
                var vm = this;

                function checkEmail(email) {
                    //var regExp = /(^[a-z]([a-z_\.]*)@([a-z_\.]*)([.][a-z]{3})$)|(^[a-z]([a-z_\.]*)@([a-z_\.]*)(\.[a-z]{3})(\.[a-z]{2})*$)/i;
                    var regExp = /(^[a-z]([a-z_\.]*)@([a-z_\.]*)([.][a-z]{3})$)|(^[a-z]([a-z_\.]*)@([a-z-0-9]*)(\.[a-z]{3})(\.[a-z]{2})*$)/i;
                    return regExp.test(email);
                }

                function checkEmails() {
                    var defer = $q.defer();
                    var hasErrors = false;
                    var emailArray = vm.mailConfig.mailAddresses;
                    if (emailArray.length > 0) {
                        for (var i = 0; i <= (emailArray.length - 1); i++) {
                            hasErrors = false;
                            if (!checkEmail(emailArray[i])) {
                                hasErrors = true;
                            }
                            if (i === emailArray.length - 1) {
                                defer.resolve(hasErrors);
                            }
                        }
                    } else {
                        defer.resolve(true);    //true means has errors
                    }
                    return defer.promise;
                }
                vm.mailConfig = {
                    mailAddresses: []
                };

                function sendEmail(sendAsInvoice) {
                    workOrdersFactory.sendInvoiceMail({ BarCode: vm.barcode, SendAsInvoice: sendAsInvoice, emailAddresses: vm.mailConfig.mailAddresses, TaxRate: vm.taxrate }).then(function () {
                        fpmUtilitiesFactory.alerts.alert("Email Sent", "Email Sent Successfully");
                    });
                }

                function onOrderEmailActionClicked() {
                    var signatureAction = $ionicActionSheet.show({
                        buttons: [
                            { text: 'Send As Invoice' }, { text: "Send As Work Order" }
                        ],
                        titleText: 'Work Order Email Options',
                        cancelText: 'Cancel',
                        cancel: function () {

                        },
                        buttonClicked: function (index) {
                            if (index === 0 || index === 1) {
                                sendEmail(index === 0);
                            }
                            return true;
                        }
                    });
                }
                vm.events = { onOrderEmailActionClicked: onOrderEmailActionClicked };
                vm.$onInit = function () {
                    console.log("DF", vm.defaultEmails);
                }
            }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("orderEmailCardComponent", componentConfig);
})();