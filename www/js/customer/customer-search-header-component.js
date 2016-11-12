(function () {
  "use strict";
  var componentConfig = {
    bindings: {
      onCustomerSelected: "&"
    },
    controller: ["$scope", "$ionicModal", "customers-file-factory", function ($scope, $ionicModal, customerFileFactory) {
      var vm = this;
      vm.searchValue = "";

      function onSearchBoxTapped() {
        vm.searchValue = "";
        vm.customers = [];
        vm.customerModal.show();
      }

      function applySearch() {
        customerFileFactory.searchCustomers(vm.searchValue).then(function (response) {
          vm.customers = response;
        });
      }

      function closeSearchModal() {
        vm.searchValue = "";
        vm.customers = [];
        vm.customerModal.hide();
      }

      function onCustomerSelected(customer) {
        vm.customerModal.hide();
        if (angular.isFunction(vm.onCustomerSelected)) {
          vm.onCustomerSelected({
            customer: customer
          });
        }
        console.log(customer);
      }

      vm.events = {
        onSearchBoxTapped: onSearchBoxTapped,
        applySearch: applySearch,
        closeSearchModal: closeSearchModal,
        onCustomerSelected: onCustomerSelected
      };

      $ionicModal.fromTemplateUrl("customerSearchModal.html", {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        vm.customerModal = modal;
      });
    }],
    controllerAs: "vm",
    templateUrl: "js/customer/customer-search-header-component-template.html",
    replace: true
  };
  angular.module("fpm").component("customerSearchHeaderComponent", componentConfig);
})();