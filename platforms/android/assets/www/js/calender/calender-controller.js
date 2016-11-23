(function () {
    "use strict";
    function initController($scope, $state, $timeout, $ionicActionSheet, localStorageService, fpmUtilitiesFactory, fieldPromaxConfig, workOrdersFactory) {
        var vm = this;
        var localStoreKeys = fieldPromaxConfig.localStorageKeys;
        vm.calendar = {
            mode: 'day',
            events: [],
            noEventLabel: "No Schedules Found",
            currentDate: new Date()
        };
        vm.viewTitle = "Calendar";
        var alerts = fpmUtilitiesFactory.alerts;
        vm.events = {
            onTimeSelected: function (selectedTime, events) {

            },
            onEventSelected: function (event) {
                if (event.eventType === 1) {
                    var order = event.originalObject;
                    fpmUtilitiesFactory.alerts.confirm("Confirmation", "Are you sure to edit this work order?", function () {
                        $state.go("app.editOrder", { barCode: order.barcode, technicianNum: order.num, src: "calender" });
                    });
                }
            },
            today: function () {
                vm.calendar.currentDate = new Date();
            },
            changeMode: function (mode) {
                vm.calendar.mode = mode;
            },
            onViewTitleChanged: function (title) {
                vm.viewTitle = title;
            },
            refreshOnPullDown: function () {
                getCalendarEvents(true);
            },
            showActionSheet: function () {
                $ionicActionSheet.show({
                    buttons: [
                        {
                            text: "Work Week View"
                        },
                        {
                            text: "Day View"
                        },
                        {
                            text: "Month View"
                        },
                        {
                            text: "Refresh Calender"
                        }],
                    titleText: 'Calendar Options',
                    cancelText: 'Cancel',
                    cancel: function () {
                        // add cancel code..
                    },
                    buttonClicked: function (index) {
                        if (index === 0) {
                            vm.events.changeMode('week');
                        }
                        if (index === 1) {
                            vm.events.changeMode('day');
                        }
                        if (index === 2) {
                            vm.events.changeMode('month');
                        }
                        if (index === 3) {
                            getCalendarEvents(true);
                        }
                        return true;
                    }
                });
            }
        };
        function populateEventsFromEstimates(estimates) {
            angular.forEach(estimates, function (est) {
                var start = kendo.parseDate(est.scheduledStartDateTime);
                var end = kendo.parseDate(est.scheduledFinishDateTime);
                if (start && end) {
                    vm.calendar.events.push({
                        startTime: start,
                        endTime: end,
                        allDay: false,
                        title: est.barcodeName + " (Estimate)",
                        originalObject: angular.copy(est),
                        eventType: 2
                    });
                }
            });
        }
        function populateEventsFromSchedules(schedules) {
            angular.forEach(schedules, function (sch) {
                var start = kendo.parseDate(sch.scheduledStartDateTime);
                var end = kendo.parseDate(sch.scheduledFinishDateTime);
                if (start && end) {
                    vm.calendar.events.push({
                        startTime: start,
                        endTime: end,
                        allDay: false,
                        title: sch.barcodeName + " (Schedule)",
                        originalObject: angular.copy(sch),
                        eventType: 1
                    });
                }
            });
        }
        function populateEventsFromVacations(vacations) {
            angular.forEach(vacations, function (v) {
                var start = kendo.parseDate(v.cacationDate);
                var end = kendo.parseDate(v.vacationDate);
                if (v.endDateTime) {
                    end = kendo.parseDate(v.endDateTime);
                }
                if (start && end) {
                    vm.calendar.events.push({
                        startTime: start,
                        endTime: end,
                        allDay: v.isAllDay,
                        title: v.vacationString,
                        originalObject: angular.copy(v),
                        eventType: 3
                    });
                }
            });
        }
        function getCalendarEvents(forceGet) {
            vm.calendar.events = [];
            fpmUtilitiesFactory.showLoading().then(function () {
                workOrdersFactory.getDatewiseEvents(forceGet).then(function (response) {
                    if (response) {
                        if (response.estimates.length > 0) {
                            populateEventsFromEstimates(response.estimates);
                        }
                        if (response.schedules.length > 0) {
                            populateEventsFromSchedules(response.schedules);
                        }
                        if (response.vacations.length > 0) {
                            populateEventsFromVacations(response.vacations);
                        }
                    }
                }).finally(fpmUtilitiesFactory.hideLoading);
            });
        }
        function activateController() {
            var userSettings = localStorageService.get(localStoreKeys.settingsKeyName);
            if (userSettings && userSettings.DefaultCalenderViewForMobile) {
                if (userSettings.DefaultCalenderViewForMobile === "workWeek") {
                    vm.events.changeMode("week");
                } else {
                    vm.events.changeMode(userSettings.DefaultCalenderViewForMobile);
                }
            }
            getCalendarEvents(false);
        }

        $scope.$on("$ionicView.afterEnter", function (e, data) {
            activateController();
        });


    }
    initController.$inject = ["$scope", "$state", "$timeout", "$ionicActionSheet", "localStorageService", "fpm-utilities-factory", "fieldPromaxConfig", "work-orders-factory"];
    angular.module("fpm").controller("calendar-controller", initController);
})();