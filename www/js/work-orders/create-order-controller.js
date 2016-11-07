(function () {
  "use strict";

  function initController($scope, $state, $ionicActionSheet, $ionicLoading, workOrderFactory,
    sharedDataFactory, fpmUtilitiesFactory) {
    var vm = this;
    var alerts = fpmUtilitiesFactory.alerts;

    function getBarcodeNumber() {
      workOrderFactory.getBarCodeNumber().then(function (response) {
        vm.woEntity.barCode = response.barcode;
        vm.woEntity.barCodeName = response.barcodeName;
      });
    }

    function createEntity() {
      workOrderFactory.createEntity().then(function (response) {
        vm.woEntity = angular.copy(response);
        vm.woEntity.fromMobile = true;
        initDates();
      }).finally(getBarcodeNumber);
    }

    vm.errors = [];

    function onSubmitButtonClicked(isValid) {
      vm.errors = [];
      vm.showError = false;
      if (vm.isCustomerSelected === false) {
        vm.errors.push("Please select a customer first");
        vm.showError = true;
        return false;
      }
      $ionicLoading.show({
        template: "creating work order..."
      }).then(function () {
        vm.woEntity.scheduleStart = fpmUtilitiesFactory.toStringDate(vm.dates.startDate);
        vm.woEntity.scheduleEnd = fpmUtilitiesFactory.toStringDate(vm.dates.endDate);
        workOrderFactory.createWorkOrder(vm.woEntity).then(function (response) {
          if (response) {
            if (response.errors.length > 0) {
              vm.errors = response.errors;
              vm.showError = true;
            } else {
              alerts.alert("Success", "Work Order created successfully", function () {
                $state.go("app.dashboard");
              });
            }
          }
        }).finally($ionicLoading.hide);
      });
    }

    function onServiceAddressActionClicked() {
      $ionicActionSheet.show({
        buttons: [{
          text: 'Same as Business Address'
        }, {
          text: "Clear Address"
        }],
        titleText: 'Service Address Options',
        cancelText: 'Cancel',
        cancel: function () {
          // add cancel code..
        },
        buttonClicked: function (index) {
          if (index === 0) {
            vm.woEntity.sStreet = vm.woEntity.bStreet;
            vm.woEntity.sState = vm.woEntity.bState;
            vm.woEntity.sCity = vm.woEntity.bCity;
            vm.woEntity.sZip = vm.woEntity.bZip;
          }
          if (index === 1) {
            vm.woEntity.sStreet = "";
            vm.woEntity.sState = "";
            vm.woEntity.sCity = "";
            vm.woEntity.sZip = "";
          }
          return true;
        }
      });
    }

    function initDates() {
      vm.dates = {
        startDate: new Date(),
        endDate: new Date(moment().add(1, "hours"))
      }
    }
    initDates();

    function onBackToDashboardClicked() {
      $state.go("app.dashboard");
    }

    vm.isCustomerSelected = false;

    vm.events = {
      onCustomerSelected: function (customer) {
        vm.isCustomerSelected = true;
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
        vm.woEntity.uin = customer.uin;
        vm.woEntity.email = customer.email_Group;
        vm.woEntity.mobile = customer.mobile;
        vm.woEntity.sStreet = customer.shipStreet == null ? "" : customer.shipStreet.replace("::", "\n");
        vm.woEntity.sState = customer.shipState;
        vm.woEntity.sCity = customer.shipCity;
        vm.woEntity.sZip = customer.shipZIP;
      },
      onSubmitButtonClicked: onSubmitButtonClicked,
      onServiceAddressActionClicked: onServiceAddressActionClicked,
      onBackToDashboardClicked: onBackToDashboardClicked
    };

    function activateController() {
      sharedDataFactory.getIniitialData().then(function (response) {
        if (response) {
          vm.jobTypes = response.jobTypes;
          vm.serviceProviders = response.serviceProviders;
        }
      }).finally(createEntity);
    }
    activateController();
  }
  initController.$inject = ["$scope", "$state", "$ionicActionSheet", "$ionicLoading", "work-orders-factory",
    "shared-data-factory", "fpm-utilities-factory"
  ];
  angular.module("fpm").controller("create-order-controller", initController);
})();
