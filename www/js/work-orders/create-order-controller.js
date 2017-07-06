(function () {
  "use strict";

  function initController($scope, $state, $timeout, $ionicActionSheet, workOrderFactory, sharedDataFactory, fpmUtilitiesFactory, authenticationFactory) {
    var vm = this;
    var alerts = fpmUtilitiesFactory.alerts;
    vm.userInfo = authenticationFactory.getLoggedInUserInfo();

    function getBarcodeNumber() {
      workOrderFactory.getBarCodeNumber().then(function (response) {
        vm.woEntity.barCode = response.barcode;
        vm.woEntity.barCodeName = response.barcodeName;
      }).finally(fpmUtilitiesFactory.hideLoading);
    }

    function createEntity() {
      fpmUtilitiesFactory.showLoading().then(function () {
        workOrderFactory.createEntity().then(function (response) {
          vm.woEntity = angular.copy(response);
          vm.woEntity.fromMobile = true;
          if (vm.isServiceProvider === true) {
            var timer = $timeout(function () {
              vm.woEntity.serviceProvider = vm.userInfo.userEmail;
              $timeout.cancel(timer);
            }, 100);
          }
          initDates();
        }).finally(getBarcodeNumber);
      });
    }

    vm.errors = [];

    function onSubmitButtonClicked(isValid) {
      vm.errors = [];
      if (vm.isCustomerSelected === false) {
        vm.errors.push("Please select a customer first");
        return false;
      }
      fpmUtilitiesFactory.showLoading("creating work order...").then(function () {
        vm.woEntity.scheduleStart = fpmUtilitiesFactory.toStringDate(vm.dates.startDate);
        vm.woEntity.scheduleEnd = fpmUtilitiesFactory.toStringDate(vm.dates.endDate);
        sharedDataFactory.getAddressCoorinates(vm.woEntity.sState, vm.woEntity.sZip, vm.woEntity.sCity, vm.woEntity.sStreet).then(function (loc) {
          vm.woEntity.longitude = loc.log;
          vm.woEntity.latitude = loc.lat;
          workOrderFactory.createWorkOrder(vm.woEntity).then(function (response) {
            if (response) {
              if (response.errors.length > 0) {
                vm.errors = response.errors;
              } else {
                alerts.alert("Success", "Work Order created successfully", function () {
                  $state.go("app.dashboard", { refresh: true });
                });
              }
            }
          }, function () {
            vm.errors = ["Error while creating work order"];
          }).finally(fpmUtilitiesFactory.hideLoading);
        });
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
      $state.go("app.dashboard", { refresh: false });
    }

    vm.isCustomerSelected = false;

    vm.events = {
      sameAsBilling: function () {
        vm.woEntity.sStreet = vm.woEntity.bStreet;
        vm.woEntity.sState = vm.woEntity.bState;
        vm.woEntity.sCity = vm.woEntity.bCity;
        vm.woEntity.sZip = vm.woEntity.bZip;
      },
      clearServiceAddress: function () {
        vm.woEntity.sStreet = "";
        vm.woEntity.sState = "";
        vm.woEntity.sCity = "";
        vm.woEntity.sZip = "";
      },
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
      onBackToDashboardClicked: onBackToDashboardClicked
    };

    function activateController() {
      sharedDataFactory.getIniitialData().then(function (response) {
        if (response) {
          vm.jobTypes = response.jobTypes;
          vm.serviceProviders = response.serviceProviders;
          vm.isServiceProvider = !vm.userInfo.isAdminstrator;
        }
      }).finally(createEntity);
    }
    activateController();
  }
  initController.$inject = ["$scope", "$state", "$timeout", "$ionicActionSheet", "work-orders-factory", "shared-data-factory", "fpm-utilities-factory", "authenticationFactory"];
  angular.module("fpm").controller("create-order-controller", initController);
})();
