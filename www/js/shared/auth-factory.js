(function () {
    "use strict";

    function initFactory($http, $q, $rootScope, $state, $window, $timeout, localStorageService, fieldPromaxConfig) {
        var serviceBase = fieldPromaxConfig.fieldPromaxApi;
        var localStorageKeys = fieldPromaxConfig.localStorageKeys;
        var authentication = {
            isAuth: false,
            userName: ""
        };
        function login(loginModel) {
            function onLoginSuccess(response) {
                console.log("RESPONSE");
            }
            function onLoginError() {
                console.log("ERROR");
            }
            var data = "grant_type=password&username=" + loginModel.userName + "&password=" + loginModel.password + "&client_id=fieldPromaxMob";
            var defered = $q.defer();

            $http.post(serviceBase + "token", data, { headers: { 'Content-Type': "application/x-www-form-urlencoded" } }).success(onLoginSuccess).error(onLoginError);
            return defered.promise;
        }

        var factory = {
            login: login
        };
        return factory;
    }

    initFactory.$inject = ["$http", "$q", "$rootScope", "$state", "$window", "$timeout", "localStorageService", "fieldPromaxConfig"];
    angular.module("fpm").factory("authenticationFactory", initFactory);
})();