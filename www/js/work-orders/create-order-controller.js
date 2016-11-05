(function () {
  "use strict";

  function initController($scope, $state, workOrderFactory, sharedDataFactory) {
    var vm = this;

    function createEntity() {
      workOrderFactory.createEntity().then(function (response) {
        vm.woEntity = angular.copy(response);
      });
    }

    vm.events = {
      onCustomerSelected: function (customer) {
        console.log("CUSTOMER", customer);
        vm.woEntity.firstName = customer.firstName;
        vm.woEntity.lastName = customer.lastName;
        vm.woEntity.companyName = customer.company;
        vm.woEntity.displayName = customer.name;
        vm.woEntity.bCity = customer.addressCity;
        vm.woEntity.bState = customer.addressCountrySubDivCode;
        vm.woEntity.bStreet = customer.street == null ? null : customer.street.replace("::", "\n");
        vm.woEntity.bZip = customer.addressPostalCode;
        vm.woEntity.phone = customer.phone;
        vm.woEntity.fax = customer.fax;
        vm.woEntity.uin = customer.uIN;
        vm.woEntity.email = customer.email_Group;
        vm.woEntity.mobile = customer.mobile;
        vm.woEntity.sStreet = customer.shipStreet == null ? "" : customer.shipStreet.replace("::", "\n");
        vm.woEntity.sState = customer.shipState;
        vm.woEntity.sCity = customer.shipCity;
        vm.woEntity.sZip = customer.shipZIP;
        console.log("WORK ORDER", vm.woEntity);
      }
    };

    function activateController() {
      sharedDataFactory.getIniitialData(true).then(function (response) {
        if (response) {
          vm.jobTypes = response.jobTypes;
          vm.serviceProviders = response.serviceProviders;
        }
      }).finally(createEntity);

    }
    activateController();
  }
  initController.$inject = ["$scope", "$state", "work-orders-factory", "shared-data-factory"];
  angular.module("fpm").controller("create-order-controller", initController);
})();
