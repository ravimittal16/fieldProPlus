(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            barcode: "<",
            onCancelClicked: "&",
            onAddCompleted: "&",
            serviceProviders: "<"
        },
        controller: ["$scope", "fpm-utilities-factory", "work-orders-factory", "authenticationFactory",
            function ($scope, fpmUtilitiesFactory, workOrdersFactory, authenticationFactory) {
                var vm = this;
                vm.errors = [];
                var scheduleSchema = { serviceProvider: "", startDate: new Date(), endTime: new Date(), fromMobile: true, barCode: vm.barcode, intuitQboItemId: "" };
                vm.newSchedule = angular.copy(scheduleSchema);
                vm.events = {
                    closeProductEditModal: function () {
                        if (angular.isFunction(vm.onCancelClicked)) {
                            vm.onCancelClicked();
                        }
                    },
                    addScheduleClicked: function () {
                        vm.errors = [];
                        vm.showError = false;
                        var schedule = angular.copy(vm.newSchedule);
                        schedule.startDate = fpmUtilitiesFactory.toStringDate(vm.newSchedule.startDate);
                        schedule.endTime = fpmUtilitiesFactory.toStringDate(vm.newSchedule.endTime);
                        fpmUtilitiesFactory.showLoading().then(function () {
                            workOrdersFactory.addWorkOrderSchedule(schedule).then(function (response) {
                                if (angular.isDefined(response.model) && angular.isArray(response.model.errors) && response.model.errors.length > 0) {
                                    vm.errors = response.model.errors;
                                    vm.showError = true;
                                } else {
                                    vm.onAddCompleted({ o: { invoice: response.invoice, schedules: response.schedule } });
                                }
                            }).finally(fpmUtilitiesFactory.hideLoading);
                        })
                    },
                    onServiceProviderSelectionChanged: function () {

                    }
                };

                vm.$onInit = function () {
                    vm.user = authenticationFactory.getLoggedInUserInfo();
                }
            }],
        controllerAs: "vm",
        templateUrl: "js/work-orders/add-schedule-modal-component.template.html"
    };
    angular.module("fpm").component("addScheduleModalComponent", componentConfig);
})();