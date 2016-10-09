(function () {
    "use strict";
    function initController($scope, $state, workOrderFactory, localStorageService) {
        var vm = this;

        function loadDashboard(callback) {
            workOrderFactory.getMobileDashboard().then(function (response) {
                vm.result = response.result;
            }).finally(function () {
                if (angular.isFunction(callback)) {
                    callback();
                }
            });
        }

        function activateController() {
            loadDashboard();
        }
        vm.events = {
            onOrderClicked: function (order) {
                if (order) {
                    console.log(order);
                    //$state.go(states.orderEdit, { barCode: $.trim(order.Barcode), technicianNum: order.TechnicianScheduleNum, src: states.main });
                    $state.go("app.editOrder", { barCode: order.Barcode, technicianNum: order.TechnicianScheduleNum, src: "main" });
                }
            },
            refreshOnPullDown: function () {
                loadDashboard(function () {
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
    }
    initController.$inject = ["$scope", "$state", "work-orders-factory", "localStorageService"];
    angular.module("fpm").controller("dashboard-controller", initController);
})();