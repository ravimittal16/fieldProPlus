(function () {
  "use strict";
  var componentConfig = {
    bindings: {
      isEstimate: "<",
      onSendEmailClicked: "&",
      showPrice: "<",
      hideEmailButton: "<",
      barcode: "<",
      taxrate: "<",
      defaultEmails: "<",
      isBusy: "<"
    },
    templateUrl: "js/work-orders/work-order-email-card-template.html",
    controller: ["$q", "work-orders-factory", "fpm-utilities-factory",
      function ($q, workOrdersFactory, fpmUtilitiesFactory) {
        var vm = this;
        vm.emailErrors = [];
        vm.sendingEmails = false;

        function checkEmail(email) {
          //var regExp = /(^[a-z]([a-z_\.]*)@([a-z_\.]*)([.][a-z]{3})$)|(^[a-z]([a-z_\.]*)@([a-z_\.]*)(\.[a-z]{3})(\.[a-z]{2})*$)/i;
          var regExp = /(^[a-z-0-9]([a-z-0-9_\.]*)@([a-z_\.]*)([.][a-z]{3})$)|(^[a-z]([a-z_\.]*)@([a-z-0-9]*)(\.[a-z]{3})(\.[a-z]{2})*$)/i;
          return regExp.test(email);
        }

        function checkEmails() {
          var defer = $q.defer();
          var hasErrors = false;
          var emailArray = vm.mailConfig.mailAddresses;
          if (emailArray.length > 0) {
            for (var i = 0; i <= (emailArray.length - 1); i++) {
              hasErrors = false;
              var email = $.trim(emailArray[i]);
              if (!checkEmail(email)) {
                hasErrors = true;
              }
              if (i === emailArray.length - 1) {
                defer.resolve(hasErrors);
              }
            }
          } else {
            defer.resolve(true); //true means has errors
          }
          return defer.promise;
        }
        vm.mailConfig = {
          mailAddresses: []
        };

        function sendEmail(sendAsInvoice) {
          vm.emailErrors = [];
          vm.sendingEmails = false;
          if (vm.mailConfig.mailAddresses && vm.mailConfig.mailAddresses.length > 0) {
            checkEmails().then(function (havingInvalidEmails) {
              if (!havingInvalidEmails) {
                vm.sendingEmails = true;
                if (!vm.isEstimate) {
                  workOrdersFactory.sendInvoiceMail({
                    BarCode: vm.barcode,
                    SendAsInvoice: sendAsInvoice,
                    emailAddresses: vm.mailConfig.mailAddresses,
                    TaxRate: vm.taxrate
                  }).then(function () {
                    fpmUtilitiesFactory.alerts.alert("Email Sent", "Email has been sent successfully", function () {
                      vm.sendingEmails = false;
                    });
                  });
                } else {
                  if (angular.isFunction(vm.onSendEmailClicked)) {
                    vm.onSendEmailClicked({
                      mails: vm.mailConfig.mailAddresses
                    });
                  }
                }
              } else {
                vm.emailErrors = ["Please enter valid emails"];
              }
            });
          }
        }

        vm.events = {
          sendEmail: sendEmail
        };

        vm.$onInit = function () {
          if (vm.defaultEmails != null && vm.defaultEmails.includes(",")) {
            var emailArray = [];
            var emailAddresses = vm.defaultEmails.split(",");
            angular.forEach(emailAddresses, function (email) {
              emailArray.push(email);
            });
            vm.mailConfig.mailAddresses = emailArray;
          }
          if (vm.defaultEmails != null && !vm.defaultEmails.includes(",")) {
            vm.mailConfig.mailAddresses = [vm.defaultEmails];
          }
        }
      }
    ],
    controllerAs: "vm"
  };
  angular.module("fpm").component("orderEmailCardComponent", componentConfig);
})();
