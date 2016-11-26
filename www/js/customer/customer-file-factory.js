(function () {
  "use strict";

  function initFactory(apiBaseFactory, fieldPromaxConfig) {
    var apibaseurl = "api/CustomerFile/";

    function searchCustomers(searchPattern) {
      return apiBaseFactory.get(apibaseurl + "SearchCustomers?searchPattern=" + searchPattern);
    }
    function createCustomer(customerModel) {
      return apiBaseFactory.post(apibaseurl + "CreateCustomer?fromMobile=true", customerModel);
    }
    return {
      createCustomer: createCustomer,
      searchCustomers: searchCustomers
    };
  }
  initFactory.$inject = ["api-base-factory", "fieldPromaxConfig"];
  angular.module("fpm").factory("customers-file-factory", initFactory);
})();
