(function () {
  "use strict";

  function initFactory(apiBaseFactory) {
    var api = "api/workorders/";

    var factory = {
      serviceProviders: []
    };

    return factory;
  }
  initFactory.$inject = ["api-base-factory"]
  angular.module("fpm").factory("dashboard-factory", initFactory);
})();
