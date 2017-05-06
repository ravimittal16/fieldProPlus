(function () {
    "use strict";
    function _initFactory($q, apiContext, localStorageService) {
        var apibase = "api/Estimates/";
        function createEntity() {
            var entityFromStorage = localStorageService.get("estimateEntitySchema");
            if (entityFromStorage) {
                return $q.when(entityFromStorage);
            } else {
                return apiContext.get(apibase + "CreateEntity").then(function (entity) {
                    localStorageService.set("estimateEntitySchema", entity);
                    return entity;
                });
            }
        }

        function createWorkOrderEstimate(model) {
            return apiContext.post(apibase + "CreateWorkOrderEstimate", model);
        }

        function getAllEstimates() {
            return apiContext.get(apibase + "GetEstimates?status=0");
        }

        function getEstimateDetails(id) {
            return apiContext.get(apibase + "GetEstimateDetails?estimateId=" + id + "&fromMobile=true");
        }

        return {
            getEstimateDetails: getEstimateDetails,
            getAllEstimates: getAllEstimates,
            createWorkOrderEstimate: createWorkOrderEstimate,
            createEntity: createEntity
        }
    }
    _initFactory.$inject = ["$q", "api-base-factory", "localStorageService"];
    angular.module("fpm").factory("estimates-factory", _initFactory);
})();