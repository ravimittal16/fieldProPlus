(function () {
    "use strict";
    function initController($scope, $state, $timeout, $stateParams, $ionicActionSheet, $ionicLoading,
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
                                if (index === 0) {
                                    vm.productSearchModal.show();
                                }
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
                        vm.currentProduct = angular.copy(product);
                        vm.productModal.show();
                    },
                    onDeleteProductClicked: function (product) {
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

        $ionicModal.fromTemplateUrl("productSearchModal.html", {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            vm.productSearchModal = modal;
        });


        $ionicModal.fromTemplateUrl("editProductModal.html", {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            vm.productModal = modal;
        });

        $scope.$on("$fpm:closeEditProductModal", function () {
            vm.productModal.hide();
        });

        $scope.$on("$fpm:closeProductSearchModal", function ($event, args) {
            if (vm.productSearchModal) {
                if (args && args.fromProductAdd === true) {
                    workOrderFactory.getBarcodeInvoiceAndProductDetails(vm.barcode).then(function (response) {
                        vm.barCodeData.products = response.products;
                        vm.barCodeData.invoice = response.invoice;
                    });
                }
                vm.productSearchModal.hide(); 
            }
        });

        $scope.$on("$fpm:operation:updateProduct", function ($event, agrs) {
            if (agrs && vm.currentProduct) {
                var uProduct = _.filter(vm.barCodeData.products, function (p) {
                    return p.num === agrs.num;
                });
                var uInvoice = _.filter(vm.barCodeData.invoice, function (n) {
                    return n.productName !== "Labor" && n.numFromSchedule === agrs.num;
                })
                $timeout(function () {
                    if (uProduct.length > 0) {
                        uProduct[0].qty = agrs.qty;
                        uProduct[0].productDescription = agrs.productDescription;
                        uProduct[0].price = agrs.price;
                    }
                    if (uInvoice.length > 0) {
                        uInvoice[0].qty = agrs.qty;
                        uInvoice[0].productDescription = agrs.productDescription;
                        uInvoice[0].price = agrs.price;
                        uInvoice[0].totalPrice = parseFloat(agrs.qty) * parseFloat(agrs.price);
                    }
                    vm.productModal.hide();
                }, 100);
            }
        });
        vm.events = {
            showActionSheet: showActionSheet
        };
    }
    initController.$inject = ["$scope", "$state", "$timeout", "$stateParams", "$ionicActionSheet",
        "$ionicLoading", "$ionicPopup", "$ionicModal", "work-orders-factory", "fpm-utilities-factory"];
    angular.module("fpm").controller("edit-order-controller", initController);
})();