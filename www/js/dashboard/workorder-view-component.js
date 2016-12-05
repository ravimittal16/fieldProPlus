(function() {
    "use strict";
    angular.module("fpm").component("workorderViewComponent", {
        bindings: {
            odr: "<",
            trackJobStatus: "<",
            userInfo: "<",
            inRouteClicked: "&"
        },
        controller: ["$state", "fpm-utilities-factory", "work-orders-factory", function($state, fpmUtilitiesFactory, workOrdersFactory) {
            var scheduleButtons = { AcceptJob: 0, InRoute: 1, CheckIn: 3, CheckOut: 4 };
            var vm = this;
            vm.events = {
                acceptJob: function() {
                    fpmUtilitiesFactory.alerts.confirm("Confirmation!", "Are you sure you want to accept this job?", function() {
                        fpmUtilitiesFactory.showLoading().then(function() {
                            workOrdersFactory.updateJobStatus({ scheduleButton: scheduleButtons.AcceptJob, scheduleNum: vm.odr.TechnicianScheduleNum }).then(function() {
                                vm.odr.JobAcceptanceStatus = true;
                            }).finally(fpmUtilitiesFactory.hideLoading);
                        });
                    });
                },
                inRouteClicked: function() {
                    if (angular.isFunction(vm.inRouteClicked)) {
                        vm.inRouteClicked({ odr: vm.odr });
                    }
                },
                onOrderClicked: function() {
                    if (vm.odr) {
                        $state.go("app.editOrder", { barCode: vm.odr.Barcode, technicianNum: vm.odr.TechnicianScheduleNum, src: "main" });
                    }
                }
            };
            vm.$onInit = function() {
            }
        }],
        controllerAs: "vm",
        templateUrl: "js/dashboard/workorder-view-component-template.html"
    });
})();