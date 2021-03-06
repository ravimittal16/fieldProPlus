(function () {
  "use strict";

  function initController(
    $state,
    estimatesFactory,
    sharedDataFactory,
    fpmUtilities,
    authenticationFactory
  ) {
    var vm = this;
    var alerts = fpmUtilities.alerts;
    vm.errors = [];
    vm.isCustomerSelected = false;
    vm.issameaddress === false;
    vm.userInfo = authenticationFactory.getLoggedInUserInfo();
    vm.priorities = [{
      name: "Normal"
    }, {
      name: "High"
    }];
    vm.events = {
      onBackToDashboardClicked: function () {
        $state.go("app.estimates");
      },
      onSubmitButtonClicked: function (isValid) {
        vm.errors = [];
        if (!vm.isCustomerSelected) {
          vm.errors.push("Select a customer before save");
          return false;
        }
        if (isValid) {
          var e = vm.entity;
          sharedDataFactory
            .getAddressCoorinates(e.wosState, e.wosZip, e.wosCity, e.wosStreet)
            .then(function (coordinates) {
              vm.entity.longitude = coordinates.lat;
              vm.entity.latitude = coordinates.log;
              vm.entity.estimateName = "@";
              estimatesFactory
                .createWorkOrderEstimate(vm.entity)
                .then(function (response) {
                  if (response.errors) {
                    vm.errors = response.errors;
                  } else {
                    alerts.alert(
                      "Success",
                      "Estimate created successfully",
                      function () {
                        $state.go("app.editEstimate", {
                          id: response.entity.estimateId
                        });
                      }
                    );
                  }
                });
            });
        } else {
          vm.errors.push("Enter a valid email address.");
        }
      },
      sameAsBilling: function () {
        vm.issameaddress === true;
        vm.entity.wosCity = vm.entity.wobCity;
        vm.entity.wosState = vm.entity.wobState;
        vm.entity.wosStreet = vm.entity.wobStreet;
        vm.entity.wosZip = vm.entity.wobZip;
      },
      clearServiceAddress: function () {
        vm.entity.wosCity = "";
        vm.entity.wosState = "";
        vm.entity.wosStreet = "";
        vm.entity.wosZip = "";
        vm.issameaddress === false;
      },
      onCustomerSelected: function (customer) {
        vm.errors = [];
        vm.entity.woDisplayName = customer.name;
        vm.entity.woFirstName = customer.firstName;
        vm.entity.woLastName = customer.lastName;
        vm.entity.woCompanyName = customer.company;
        vm.entity.wobCity = customer.addressCity;
        vm.entity.wobState = customer.addressCountrySubDivCode;
        vm.entity.wobZip = customer.addressPostalCode;
        vm.entity.uin = customer.uin;
        vm.entity.woEmail = customer.email_Group;
        vm.entity.woPhone = customer.phone;
        vm.entity.woFax = customer.fax;
        vm.entity.wobStreet =
          customer.street == null ? "" : customer.street.replace("::", "\n");
        if (vm.issameaddress === true) {
          vm.entity.wosStreet = customer.wobStreet;
          vm.entity.wosState = vm.entity.wobState;
          vm.entity.wosCity = vm.entity.wobCity;
          vm.entity.wosZip = vm.entity.wobZip;
        } else {
          vm.entity.wosStreet =
            customer.shipStreet == null ?
            "" :
            customer.shipStreet.replace("::", "\n");
          vm.entity.wosState = customer.shipState;
          vm.entity.wosCity = customer.shipCity;
          vm.entity.wosZip = customer.shipZIP;
        }
        vm.isCustomerSelected = true;
      }
    };

    function activateController() {
      sharedDataFactory.getIniitialData().then(function (response) {
        if (response) {
          vm.jobTypes = response.jobTypes;
          vm.isServiceProvider = !vm.userInfo.isAdminstrator;
        }
      });
      estimatesFactory.createEntity().then(function (response) {
        vm.entity = angular.copy(response);
        vm.entity.estimateName = "@";
      });
    }

    activateController();
  }
  initController.$inject = [
    "$state",
    "estimates-factory",
    "shared-data-factory",
    "fpm-utilities-factory",
    "authenticationFactory"
  ];
  angular
    .module("fpm")
    .controller("create-estimate-controller", initController);
})();
