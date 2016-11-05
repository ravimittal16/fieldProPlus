(function () {
  "use strict";

  function initFactory(apiBaseFactory, fieldPromaxConfig) {
    var apibaseurl = "api/CustomerFile/";

    function searchCustomers(searchPattern) {
      return apiBaseFactory.get(apibaseurl + "SearchCustomers?searchPattern=" + searchPattern);
    }
    return {
      searchCustomers: searchCustomers
    };
  }
  initFactory.$inject = ["api-base-factory", "fieldPromaxConfig"];
  angular.module("fpm").factory("customers-file-factory", initFactory);
})();
