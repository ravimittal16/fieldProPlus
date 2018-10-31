(function () {
    "use strict";
    function _initFactory(apiBaseFactory, fieldPromaxConfig) {
        var apibaseurl = "api/CustomComponents/";

        function getComponents() {
            return apiBaseFactory.get(apibaseurl + "GetCustomComponents");
        }

        function generateReport(model) {
            if (model) {
                
                 if (model.startDate) var startDate= kendo.toString(model.startDate, "g");
                 if (model.endDate) var endDate = kendo.toString(model.endDate, "g");
            }
            return apiBaseFactory.get(apibaseurl + "GetTimeWorkedReport?startDate=" + startDate + "&endDate=" + endDate);
        }

        return {
            generateReport: generateReport,
            getComponents: getComponents
        }
    }
    _initFactory.$inject = ["api-base-factory", "fieldPromaxConfig"];
    angular.module("fpm").factory("custom-components-factory", _initFactory);
})();
