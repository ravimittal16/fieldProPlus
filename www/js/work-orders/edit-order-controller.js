(function () {
    "use strict";
    function initController($scope, $state, $stateParams, $ionicActionSheet, $ionicLoading,
        $ionicPopup, $ionicModal, workOrderFactory, fpmUtilities) {
        var vm = this;
        vm.barcode = $stateParams.barCode;
        var alerts = fpmUtilities.alerts;
        vm.invoiceOpen = false;
        function getBarcodeDetails() {
            $ionicLoading.show({ template: "getting data..." }).then(function () {
                workOrderFactory.getBarcodeDetails(vm.barcode).then(function (response) {
                    vm.barCodeData = response;
                    if (angular.isArray(response.schedules)) {
                        var _scheduleFromFilter = _.filter(response.schedules, function (sch) {
                            return sch.num === parseInt($stateParams.technicianNum, 10);
                        });
                        vm.schedule = angular.copy(_scheduleFromFilter[0]);
                        $ionicLoading.hide();
                    }
                }, function (data) {
                    $ionicPopup.alert({ title: "Oops", template: "ERROR WHILE GETTING BARCODE DATA.." });
                    $ionicLoading.hide();
                });
            });
        }
        getBarcodeDetails();



        function showActionSheet() {
            console.log("HELO WORLD");
        }

        vm.tabs = {
            sch: {
                events: {
                    onListScheduleItemTap: function (sch) {
                        console.log(sch)
                    },
                    onScheduleActionButtonClicked: function () {
                        var hideSheet = $ionicActionSheet.show({
                            buttons: [
                                { text: 'Add New Schedule' }
                            ],
                            titleText: 'Schedule',
                            cancelText: 'Cancel',
                            cancel: function () {
                                // add cancel code..
                            },
                            buttonClicked: function (index) {
                                return true;
                            }
                        });
                    }
                }
            },
            prod: {
                events: {
                    onProdcutActionButtonClicked: function () {
                        var productSheet = $ionicActionSheet.show({
                            buttons: [
                                { text: 'Add New Product' }
                            ],
                            titleText: 'New Product',
                            cancelText: 'Cancel',
                            cancel: function () {
                                // add cancel code..
                            },
                            buttonClicked: function (index) {
                                return true;
                            }
                        });
                    },
                    closeProductEditModal: function () { 
                        vm.productModal.hide();
                    },
                    openProductSearchModal: function () {

                    },
                    onEditProductClicked: function (product) {
                        vm.currentProduct = product;
                        vm.productModal.show();
                    },
                    onDeleteProductClicked: function (product) {
                        console.log(product);
                        alerts.confirmDelete(function () {
                            workOrderFactory.deleteProduct(vm.barcode, product.num).then(function (response) {
                                if (response) {
                                    vm.barCodeData.products = response.products;
                                    vm.barCodeData.invoice = response.invoice;
                                }
                            });
                        });
                    }
                }
            }
        }

        function showActionSheet() {
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: '<b>Share</b> This' },
                    { text: 'Move' }
                ],
                destructiveText: 'Delete',
                titleText: 'Modify your album',
                cancelText: 'Cancel',
                cancel: function () {
                    // add cancel code..
                },
                buttonClicked: function (index) {
                    return true;
                }
            });
        }



        $ionicModal.fromTemplateUrl("editProductModal.html", {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            vm.productModal = modal;
        });


        vm.events = {
            showActionSheet: showActionSheet
        };
    }
    initController.$inject = ["$scope", "$state", "$stateParams", "$ionicActionSheet",
        "$ionicLoading", "$ionicPopup", "$ionicModal", "work-orders-factory", "fpm-utilities-factory"];
    angular.module("fpm").controller("edit-order-controller", initController);
})();