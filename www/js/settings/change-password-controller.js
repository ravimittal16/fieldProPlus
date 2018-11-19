(function() {
  "use strict";
  function initController($state, authenticationFactory, fpmUtilitiesFactory) {
    var vm = this;
    vm.errors = [];
    vm.model = { oldPassword: "", newPassword: "", confirmPassword: "" };
    function onChangePasswordClicked(isValid) {
      vm.errors = [];
      if (isValid) {
        fpmUtilitiesFactory.showLoading().then(function() {
          authenticationFactory
            .changePassword(vm.model)
            .then(function(response) {
              if (response.success) {
                fpmUtilitiesFactory.alerts.alert(
                  "Success",
                  "Password has been changed successfully.",
                  function() {
                    authenticationFactory.logout();
                    $state.go("login");
                  }
                );
              } else if (response.errors && response.errors.length > 0) {
                vm.errors.push(response.errors[0]);
              }
            })
            .finally(fpmUtilitiesFactory.hideLoading);
        });
      } else {
        vm.errors.push("Please enter all required information.");
      }
    }
    vm.events = {
      onChangePasswordClicked: onChangePasswordClicked
    };
  }
  initController.$inject = [
    "$state",
    "authenticationFactory",
    "fpm-utilities-factory"
  ];
  angular
    .module("fpm")
    .controller("change-password-controller", initController);
})();
