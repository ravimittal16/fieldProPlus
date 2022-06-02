(function () {
    "use strict";
    function initFactory($http, $q, fieldPromaxConfig, fpmUtilitiesFactory) {
        function request(type, url, urlData) {
            var defer = $q.defer();
            function onsuccess(data, status, headers, config) {
                return defer.resolve(data);
            }

            function onerror(reason) {
                defer.reject(reason);
            }

            $http({
                method: type,
                url: fieldPromaxConfig.fieldPromaxApi + url,
                data: urlData
            })
                .success(onsuccess)
                .error(onerror);
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

        function upload(url, files, model) {
            var defer = $q.defer();

            function onsuccess(response) {
                return defer.resolve(response.data);
            }

            function onerror(reason) {
                defer.reject(reason);
            }
            $http({
                method: "POST",
                url: fieldPromaxConfig.fieldPromaxApi + url,
                headers: { "Content-Type": undefined },
                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("model", JSON.stringify(model));
                    for (var i = 0; i < files.length; i++) {
                        formData.append("file" + i, data.files[i].rawFile);
                    }
                    return formData;
                },
                data: { files: files }
            }).then(onsuccess, onerror);
            return defer.promise;
        }

        function downloadBlobFile(url, params) {
            var defer = $q.defer();

            function onsuccess(response, status, headers, config) {
                return defer.resolve(response.data);
            }

            function onerror(reason) {
                defer.reject(reason);
            }

            $http({
                method: "GET",
                url: fieldPromaxConfig.fieldPromaxApi + url,
                responseType: "arraybuffer"
            }).then(onsuccess, onerror);
            return defer.promise;
        }

        var factory = {
            downloadBlobFile: downloadBlobFile,
            upload: upload,
            get: get,
            post: post,
            deleteReq: deleteReq
        };
        return factory;
    }
    initFactory.$inject = [
        "$http",
        "$q",
        "fieldPromaxConfig",
        "fpm-utilities-factory"
    ];
    angular.module("fpm").factory("api-base-factory", initFactory);
})();
