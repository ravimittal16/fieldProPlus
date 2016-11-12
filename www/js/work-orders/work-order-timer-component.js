(function() {
    "use strict";
    var componentConfig = {
        bindings: {
            isCheckedIn: "<",
            isCheckedOut: "<",
            isApproved: "<",
            schedule: "<"
        },
        controller: ["$interval", "$state", "$element", "$timeout", "shared-data-factory",
            function($interval, $state, $element, $timeout, sharedDataFactory) {
                var model = this;
                model.currentTime = { hrs: "00", mins: "00", totalMinutes: 0, showControl: false, isRunning: false, isOnInterval: false, intervalMinutes: 0, intervalCounter: 0 };
                var interval = null;

                function updateUi() {
                    var hours = Math.floor(model.currentTime.totalMinutes / 60);
                    var minutes = Math.floor(model.currentTime.totalMinutes % 60);
                    model.currentTime.mins = minutes <= 9 ? ("0" + minutes) : minutes;
                    model.currentTime.hrs = hours <= 9 ? ("0" + hours) : hours;
                    if (hours === 0 && minutes >= 55) {
                        model.currentTime.isOnInterval = true;
                    } else if (hours > 0 && (minutes > 55 || minutes <= 5)) {
                        model.currentTime.isOnInterval = true;
                    } else {
                        model.currentTime.isOnInterval = false;
                    }
                }

                function startInterval() {
                    if (model.currentTime.showControl === false) {
                        model.currentTime.showControl = true;
                    }
                    model.currentTime.isRunning = true;
                    interval = $interval(function() {
                        model.currentTime.totalMinutes += 1;
                        console.log(model.currentTime.totalMinutes);
                        updateUi();
                    }, (1000 * 60));
                }

                function stopInterval() {
                    if (interval !== null) {
                        model.currentTime.isRunning = false;
                        $interval.cancel(interval);
                    }
                    var t = $timeout(function() {
                        model.currentTime.showControl = false;
                        $timeout.cancel(t);
                    }, 100);
                }

                this.$onDestroy = function() {
                    stopInterval();
                };
                var timerEnabled = false;
                this.$onChanges = function() {
                    if (timerEnabled === true) {
                        if (model.isCheckedIn === true && model.currentTime.isRunning === false) {
                            startInterval();
                        }
                        if (model.isCheckedOut === true) {
                            stopInterval();
                        }
                    };
                };

                function refreshTimer() {
                    updateUi();
                }

                model.events = { refreshTimer: refreshTimer };
                this.$onInit = function() {
                    model.currentTime.showControl = false;
                    sharedDataFactory.getIniitialData().then(function(response) {
                        timerEnabled = response.customerNumberEntity.workOrderTimerEnabled || false;
                        if (timerEnabled === true) {
                            $timeout(function() {
                                if (model.schedule) {
                                    model.currentTime.showControl = ((model.schedule.checkInStatus === true) && (model.schedule.checkOutStatus === false));
                                    if (model.schedule.checkInStatus === true && model.schedule.timerStartAt) {
                                        if ((model.schedule.checkOutStatus || false) === false) {
                                            var totalMins = moment(new Date()).diff(moment(model.schedule.timerStartAt), "minutes");
                                            if (totalMins > 0) {
                                                model.currentTime.totalMinutes = totalMins;
                                                updateUi();
                                            }
                                        }
                                    }
                                }
                            }, 1000);
                        }
                    });
                };
            }],
        templateUrl: "js/work-orders/work-order-timer-component.template.html",
        controllerAs: "model"
    };
    angular.module("fpm").component("workOrderTimerComponent", componentConfig);
})();