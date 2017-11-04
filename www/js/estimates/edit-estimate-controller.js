(function () {
    "use strict"
    function _initController($scope, $state, $window, $stateParams, $timeout, estimatesFactory, sharedDataFactory, fpmUtilities, authenticationFactory) {
        var vm = this;
        vm.estimateId = $stateParams.id;
        vm.enableMarkup = true;
        vm.user = authenticationFactory.getLoggedInUserInfo();
        //console.log(vm.user);

        var alerts = fpmUtilities.alerts;
        function openEditProductModal() {
            if (vm.currentProduct) {
                if (vm.productModal) {
                    vm.productModal.show();
                } else {
                    fpmUtilities.getModal("editProductModal.html", $scope).then(function (modal) {
                        vm.productModal = modal;
                        vm.productModal.show();
                    });
                }
            }
        }
        vm.events = {
            onProdcutActionButtonClicked: function () {
                openProductSearchModal();
            },
            onAddProductCompleted: function (product) {
                console.log(product);
            },
            onEditProductClicked: function (prod) {
                vm.currentProduct = prod;
                openEditProductModal();
            },
            onDeleteProductClicked: function (prod) {
                alerts.confirmDelete(function () {
                    fpmUtilities.showLoading();
                    estimatesFactory.deleteProduct(prod.num, prod.estimateId)
                        .then(function (response) {
                            if (response && response.entity && response.entity.products) {
                                vm.est.products = response.entity.products;
                                vm.est.invoice = response.entity.invoice;
                                alerts.alert("Success", "Product has been deleted successfully.");
                            }
                        }).finally(fpmUtilities.hideLoading)
                });
            },
            onTaxCheckboaxChanged: function (inv) { },
            onDescriptionOrNotesChanged: function () { },
            onAddressTapped: function () {
                var goourl = "http://maps.google.com/maps?saddr=Current+Location&daddr=";
                var d = vm.est.estimate;
                if (d.wosStreet) {
                    goourl += d.wosStreet.replace("::", " ");
                }
                goourl += " " + d.wosCity + ", " + d.wosState + " " + d.wosZip;
                $window.open(goourl, '_blank', 'location=yes');
            }
        }

        function openProductSearchModal() {
            if (vm.productSearchModal) {
                vm.productSearchModal.show();
            } else {
                fpmUtilities.getModal("productSearchModal.html", $scope).then(function (modal) {
                    vm.productSearchModal = modal;
                    vm.productSearchModal.show();
                });
            }
            $timeout(function () {
                $scope.$broadcast("$fpm:changeAddModalOpenPriority", false);
            }, 1000)
        }

        function _getEstimateDetails() {
            estimatesFactory.getEstimateDetails($stateParams.id).then(function (response) {
                vm.est = response;
            });
        }

        function _addProductToEstimate(product) {
            var e = vm.est.estimate;
            fpmUtilities.showLoading().then(function () {
                estimatesFactory.addProductToEstimate(product.productNumber, e.woBarCode, e.estimateId).then(function (response) {
                    if (response && response.entity && response.entity.products) {
                        vm.est.products = response.entity.products;
                        vm.est.invoice = response.entity.invoice;
                        vm.productSearchModal.hide();
                    }
                }).finally(fpmUtilities.hideLoading);
            });
        }

        $scope.$on("$fpm:onProductSelected", function ($emit, product) {
            if (product) {
                _addProductToEstimate(product);
            }
        });

        $scope.$on("$fpm:operation:updateProduct", function (event, args) {
            if (args) {
                vm.est.products = args.entity.products;
                vm.est.invoice = args.entity.invoice;
                vm.productModal.hide();
            }
        });

        $scope.$on("$fpm:closeEditProductModal", function () {
            vm.productModal.hide();
        });

        $scope.$on("$fpm:closeProductSearchModal", function () {
            vm.productSearchModal.hide();
        })

        function activateController() {
            _getEstimateDetails();
            vm.user.showPrice = true;
        }

        activateController();
    }
    _initController.$inject = ["$scope", "$state", "$window", "$stateParams", "$timeout", "estimates-factory", "shared-data-factory", "fpm-utilities-factory", "authenticationFactory"];
    angular.module("fpm").controller("edit-estimate-controller", _initController);
})();