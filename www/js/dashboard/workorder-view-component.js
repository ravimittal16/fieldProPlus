(function () {
    "use strict";
    angular.module("fpm").component("workorderViewComponent", {
        bindings: {
            odr: "<"
        },
        controller: ["$state", function ($state) {
            var vm = this;
            vm.events = {
                acceptJob: function () {

                },
                inRouteClicked: function () { 
                    
                },
                onOrderClicked: function () {
                    if (vm.odr) {
                        $state.go("app.editOrder", { barCode: vm.odr.Barcode, technicianNum: vm.odr.TechnicianScheduleNum, src: "main" });
                    }
                }
            };
        }],
        controllerAs: "vm",
        templateUrl: "js/dashboard/workorder-view-component-template.html"
    });
})();