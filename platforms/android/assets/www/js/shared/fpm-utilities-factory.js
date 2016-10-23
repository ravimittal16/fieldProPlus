(function () {
    "use strict";
    function initFactory() {
        return {
            toStringDate: function (date) { 
                //return moment(date).format("MM/DD/YYYY h:mm a");
                return moment(date).format("lll");
            }
        };
    }
    angular.module("fpm").factory("fpm-utilities-factory", initFactory);
})();