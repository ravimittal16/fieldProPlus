(function () {
    "use strict";
    function initController($scope, $state, $stateParams, $timeout, $ionicModal, workOrderFactory, sharedDataFactory,
        authenticationFactory, timecardFactory, fpmUtilitiesFactory, localStorageService) {
        var vm = this;
        vm.userInfo = authenticationFactory.getLoggedInUserInfo();
        var orders = [];
        var timeCardInfo = { enabled: false, clockedInInfo: null, currentDetails: [], todaysClockIns: [] };
        var alerts = fpmUtilitiesFactory.alerts;

        function extractJsonOrdersToLocalArray() {
            orders = [];
            if (!vm.isServiceProvider || vm.havingGroupsAssigned) {
                angular.forEach(vm.result, function (r, i) {
                    if (r.dataForAdministrator && r.dataForAdministrator.length > 0) {
                        _.forEach(r.dataForAdministrator, function (p) {
                            if (p.ordersJson) {
                                _.forEach(JSON.parse(p.ordersJson), function (o) {
                                    orders.push(o);
                                });
                            }
                        })
                    }
                });
            } else {
                angular.forEach(vm.result, function (r, i) {
                    if (r.dataForServiceProvider && r.dataForServiceProvider.length > 0) {
                        _.forEach(r.dataForServiceProvider, function (p) {
                            orders.push(p);
                        });
                    }
                });
            }
        }
        vm.showingLoading = true;
        function loadDashboard(forceGet, callback) {
            vm.showingLoading = true;
            workOrderFactory.getMobileDashboard(forceGet).then(function (response) {
                vm.result = response.result;
                vm.havingGroupsAssinged = response.havingGroupsAssinged;
                if (vm.isServiceProvider && !vm.havingGroupsAssigned) {
                    barcodePropName = "barcodeName";
                }
                extractJsonOrdersToLocalArray();
            }).finally(function () {
                vm.showingLoading = false;
                if (angular.isFunction(callback)) {
                    callback();
                }
            });
        }
        var scheduleButtons = { AcceptJob: 0, InRoute: 1, CheckIn: 3, CheckOut: 4 };
        function _processInRouteClick(job) {
            alerts.confirmWithOkayCancel("Confirmation!", "Your status has been updated to In Route", function () {
                fpmUtilitiesFactory.showLoading().then(function () {
                    workOrderFactory.updateJobStatus({ scheduleButton: scheduleButtons.InRoute, scheduleNum: job.TechnicianScheduleNum, barcode: job.Barcode }).then(function () {
                        job.InRoute = true;
                    }).finally(function () {
                        fpmUtilitiesFactory.hideLoading();
                        if (timeCardInfo.enabled === true) {
                            _getTodaysTimeCardEntries();
                        }
                    });
                })
            });
        }
        function beforeFinalInRoute(job) {
            var notCheckInDetails = _.where(timeCardInfo.currentDetails, { finishTime: null });
            if (notCheckInDetails.length > 0) {
                alerts.confirmWithOkayCancel("Confirmation", "You have a task pending to check out. \n\n Previously pending tasks will be checked out automattically. \n\n Are you sure?", function () {
                    _processInRouteClick(job);
                });
            } else {
                _processInRouteClick(job);
            }
        }
        vm.isSearchModalOpened = false;
        var timerForonSearchItemClick = null;
        vm.events = {
            inRouteClicked: function (odr) {
                if (timeCardInfo.enabled === false) {
                    _processInRouteClick(odr);
                } else {
                    var runningClockIn = _.findWhere(timeCardInfo.todaysClockIns, { finishTime: null });
                    if (!angular.isDefined(runningClockIn)) {
                        alerts.confirm("Warning!", "You have not Clocked-In yet. Would you like to Clock-In now?", function () {
                            $state.go("app.timecard", { proute: $state.current.name });
                        });
                    } else {
                        beforeFinalInRoute(odr);
                    }
                }
            },
            onSearchItemClick: function (order) {
                if (order) {
                    vm.matchedOrders = [];
                    vm.isSearchModalOpened = false;
                    vm.searchModal.hide();
                    vm.searchValue = "";
                    if (vm.isServiceProvider && !vm.havingGroupsAssigned) {
                        timerForonSearchItemClick = $timeout(function () {
                            $state.go("app.editOrder", { barCode: order.barcode, technicianNum: order.technicianScheduleNum, src: "main" });
                        }, 300);
                    } else {
                        timerForonSearchItemClick = $timeout(function () {
                            $state.go("app.editOrder", { barCode: order.Barcode, technicianNum: order.TechnicianScheduleNum, src: "main" });
                        }, 300);
                    }
                }
            },
            applySearch: function () {
                if (orders && orders.length > 0) {
                    var tolower = vm.searchValue.toLowerCase();
                    var matchedOrders = _.filter(orders, function (o) {
                        return o[barcodePropName].indexOf(tolower) > -1;
                    });
                    vm.matchedOrders = _.uniq(matchedOrders, function (item, key, a) {
                        return item[barcodePropName];
                    });
                }
            },
            closeSearchModal: function () {
                vm.matchedOrders = [];
                vm.isSearchModalOpened = false;
                vm.searchModal.hide();
                vm.searchValue = "";
            },
            openSearchModal: function () {
                vm.searchValue = "";
                vm.matchedOrders = [];
                vm.isSearchModalOpened = true;
                vm.searchModal.show();
            },
            refreshOnPullDown: function () {
                loadDashboard(true, function () {
                    $scope.$broadcast("scroll.refreshComplete");
                });
                // sharedDataFactory.postLocation({ userId: "smpgaut@gmail.com", timestamp: new Date(), event: 1, isMoving: false, uuid: "as", coords: { latitude: 20.1, longitude: 1.2 } })
                //     .then(function () {
                //         console.log("SUCCESS LOCATION");
                //     }, function () {
                //         console.log("ERROR LOCATION");
                //     })
            },
            onChildGroupClicked: function (item, type, prop) {

                item.isOpen = !item.isOpen;
                var orderState = localStorageService.get("orderState");
                if (orderState === null) orderState = {};
                if (type === "DD") {
                    if (item.isOpen === true) {
                        orderState[prop] = item;
                        localStorageService.set("orderState", orderState);
                    } else {
                        localStorageService.set("orderState", null);
                    }
                    return false;
                }
                if (item.isOpen === true && item.clickCount === 0) {
                    orderState[prop] = item;
                    localStorageService.set("orderState", orderState);

                    if (type === "SP") {
                        item.dataForServiceProvider = JSON.parse(item.ordersJson);
                    } else {
                        item.ordersN = JSON.parse(item.ordersJson);
                    }
                    item.clickCount += 1;
                } else {
                    orderState[prop] = null;
                    localStorageService.set("orderState", orderState);
                }
            }
        };

        function _getTodaysTimeCardEntries() {
            var jobCodes = { CLOCK_IN: 5001, CLOCK_OUT: 5002 };
            var cdt = new Date();
            var dt = kendo.toString(new Date(cdt.getFullYear(), cdt.getMonth(), cdt.getDate(), 0, 0, 0, 0), "g");
            timecardFactory.getTimeCardByDate(dt).then(function (response) {
                if (response) {
                    timeCardInfo.todaysClockIns = _.where(response.timeCardDetails, { jobCode: jobCodes.CLOCK_IN });
                    timeCardInfo.currentDetails = _.reject(response.timeCardDetails, { jobCode: jobCodes.CLOCK_IN });
                }
            });
        }
        vm.havingGroupsAssigned = false;
        var barcodePropName = "BarcodeName";
        function activateController() {
            timeCardInfo.enabled = vm.userInfo.timeCard || false;
            vm.havingGroupsAssigned = vm.userInfo.havingGroupsAssigned;
            vm.isServiceProvider = !vm.userInfo.isAdminstrator;
            if (timeCardInfo.enabled === true) {
                _getTodaysTimeCardEntries();
            }

            sharedDataFactory.getIniitialData().then(function (response) {
                vm.trackJobStatus = response.customerNumberEntity.trackJobStatus || false;
            }).finally(function () {
                var refresh = angular.isDefined($stateParams.refresh) ? $stateParams.refresh : false;
                loadDashboard(refresh);
            });

        }

        $scope.$on("$ionicView.beforeEnter", function (e, data) {
            activateController();
        });

        $scope.$on('$destroy', function () {
            vm.searchModal.remove();
            if (timerForonSearchItemClick) {
                $timeout.cancel(timerForonSearchItemClick);
            }
        });

        $ionicModal.fromTemplateUrl("dashboardSearchModal.html", {
            scope: $scope,
            animation: 'slide-in-up',
            focusFirstInput: true
        }).then(function (modal) {
            vm.searchModal = modal;
        });
    }
    initController.$inject = ["$scope", "$state", "$stateParams", "$timeout", "$ionicModal", "work-orders-factory",
        "shared-data-factory", "authenticationFactory", "timecard-factory", "fpm-utilities-factory", "localStorageService"];
    angular.module("fpm").controller("dashboard-controller", initController);
})();