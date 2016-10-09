(function () {
    "use strict";
    function initFactory($http, $q, fieldPromaxConfig) {

        function request(type, url, urlData) {
            var defer = $q.defer();

            function onsuccess(data, status, headers, config) {
                return defer.resolve(data);
            }

            function onerror(reason) {
                defer.reject(reason);
            }

            $http({ method: type, url: fieldPromaxConfig.fieldPromaxApi + url, data: urlData }).success(onsuccess).error(onerror);
            return defer.promise;
        }

        function post(url, params) {
            return request("POST", url, JSON.stringify(params));
        }

        function get(url, params) {
            return request("GET", url, params);
        }

        function deleteReq(url, params) {
            return request("DELETE", url, params);
        }

        var factory = {
            get: get,
            post: post,
            deleteReq: deleteReq
        }
        return factory;
    }
    initFactory.$inject = ["$http", "$q", "fieldPromaxConfig"];
    angular.module("fpm").factory("api-base-factory", initFactory);
})()