(function () {
    "use strict";

    function initFactory($q, $location, localStorageService) {
        var errorCodes = {
            BadRequest: 400, PageNotFound: 401
        };
        var authInterceptorServiceFactory = {};

        var request = function (config) {

            console.log("headers", config.headers);
            config.headers = config.headers || {};
            console.log("headers", config.headers);
            var authData = localStorageService.get("authorizationData");
            if (authData) {
                config.headers.Authorization = "Bearer " + authData.token;
            }
            return config;
        };

        var responseError = function (rejection) {
            if (rejection.status === errorCodes.PageNotFound) {
                $location.path("/");
            }
            if (rejection.status === errorCodes.BadRequest && rejection.data) {
                throw rejection;
            }
            return $q.reject(rejection);
        };

        authInterceptorServiceFactory.request = request;
        authInterceptorServiceFactory.responseError = responseError;

        return authInterceptorServiceFactory;
    }

    initFactory.$inject = ["$q", "$location", "localStorageService"];
    angular.module("fpm").factory("requestIntercepter", initFactory);
})();

