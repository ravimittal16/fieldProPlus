(function() {
  "use strict";

  function initFactory($q, $location, localStorageService) {
    var errorCodes = {
      BadRequest: 400,
      PageNotFound: 401
    };
    var authInterceptorServiceFactory = {};

    var request = function(config) {
      config.headers = config.headers || {};
      var authData = localStorageService.get("authorizationData");
      if (authData) {
        config.headers.Authorization = "Bearer " + authData.token;
      }
      return config;
    };

    var responseError = function(rejection) {
      if (rejection.status === errorCodes.PageNotFound) {
        $location.path("/");
      }
      if (rejection.status === errorCodes.BadRequest && rejection.data) {
        throw rejection;
      }
      if (
        rejection &&
        rejection.data &&
        rejection.data.exceptionMessage &&
        rejection.data.exceptionMessage.indexOf("unauthorized") > 0
      ) {
        $location.path("/");
      }
      console.log("rejection", rejection);
      return $q.reject(rejection);
    };

    authInterceptorServiceFactory.request = request;
    authInterceptorServiceFactory.responseError = responseError;

    return authInterceptorServiceFactory;
  }

  initFactory.$inject = ["$q", "$location", "localStorageService"];
  angular.module("fpm").factory("requestIntercepter", initFactory);
})();
