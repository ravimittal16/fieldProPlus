(function () {
    "use strict";
    function initController($scope, $state, $timeout, $ionicModal, workOrderFactory, localStorageService) {
        var vm = this;

        function loadDashboard(forceGet, callback) {
            workOrderFactory.getMobileDashboard(forceGet).then(function (response) {
                vm.result = response.result;
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
        vm.events = {
            applySearch: function () {
                console.log(vm.result);
                console.log(vm.searchValue);
            },
            closeSearchModal: function () {
                vm.isSearchModalOpened = false;
                vm.searchModal.hide();
            },
            openSearchModal: function () {
                vm.isSearchModalOpened = true;
                vm.searchModal.show();
                $timeout(function () {
                    var searchBox = document.querySelector("#searchBox");
                    searchBox.focus();
                }, 200);
            },
            onOrderClicked: function (order) {
                if (order) {
                    console.log(order);
                    //$state.go(states.orderEdit, { barCode: $.trim(order.Barcode), technicianNum: order.TechnicianScheduleNum, src: states.main });
                    $state.go("app.editOrder", { barCode: order.Barcode, technicianNum: order.TechnicianScheduleNum, src: "main" });
                }
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
            console.log("HELLO WORLD DESTR");
            vm.searchModal.remove();
        });

        $ionicModal.fromTemplateUrl("dashboardSearchModal.html", {
            scope: $scope,
            animation: 'slide-in-up',
            focusFirstInput: true
        }).then(function (modal) {
            console.log("HELLMODAL");
            vm.searchModal = modal;
        });
    }
    initController.$inject = ["$scope", "$state", "$timeout", "$ionicModal", "work-orders-factory", "localStorageService"];
    angular.module("fpm").controller("dashboard-controller", initController);
})();