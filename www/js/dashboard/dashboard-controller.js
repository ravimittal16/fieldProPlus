(function () {
    "use strict";
    function initController($scope, $state, $timeout, $ionicModal, workOrderFactory, localStorageService) {
        var vm = this;

        var orders = [];
        function extractJsonOrdersToLocalArray() {
            orders = [];
            var isAdminstrator = true;
            if (isAdminstrator === true) {
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
            }
        }

        function loadDashboard(forceGet, callback) {
            workOrderFactory.getMobileDashboard(forceGet).then(function (response) {
                vm.result = response.result;
                extractJsonOrdersToLocalArray();
            }).finally(function () {
                if (angular.isFunction(callback)) {
                    callback();
                }
            });
        }

        function activateController() {
            loadDashboard(false);
        }
        vm.isSearchModalOpened = false;
        var timerForonSearchItemClick = null;
        vm.events = {
            onSearchItemClick: function (order) {
                if (order) {
                    vm.matchedOrders = [];
                    vm.isSearchModalOpened = false;
                    vm.searchModal.hide();
                    vm.searchValue = "";
                    timerForonSearchItemClick = $timeout(function () {
                        $state.go("app.editOrder", { barCode: order.Barcode, technicianNum: order.TechnicianScheduleNum, src: "main" });
                    }, 300);
                }
            },
            applySearch: function () {
                var tolower = vm.searchValue.toLowerCase();
                vm.matchedOrders = _.filter(orders, function (o) {
                    return o.BarcodeName.toLowerCase().indexOf(tolower) > -1;
                });
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
        $scope.$on("$ionicView.loaded", function (event, data) {
            activateController();
        });
        $scope.$on('modal.hidden', function () {
            console.log("Execute action");
        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function () {
            console.log("modal.removed");
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
    initController.$inject = ["$scope", "$state", "$timeout", "$ionicModal", "work-orders-factory", "localStorageService"];
    angular.module("fpm").controller("dashboard-controller", initController);
})();