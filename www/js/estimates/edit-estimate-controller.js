(function () {
    "use strict"
    function _initController($scope, $state, $stateParams, $timeout, estimatesFactory, sharedDataFactory, fpmUtilities, authenticationFactory) {
        var vm = this;
        vm.estimateId = $stateParams.id;
        vm.enableMarkup = false;
        vm.user = authenticationFactory.getLoggedInUserInfo();
        vm.events = {
            onProdcutActionButtonClicked: function () {
                openProductSearchModal();
            },
            onAddProductCompleted: function (product) {
                console.log(product);
            },
            onEditProductClicked: function (prod) {
                vm.currentProduct = prod;
            },
            onDeleteProductClicked: function (prod) { },
            onTaxCheckboaxChanged: function (inv) { },
            onDescriptionOrNotesChanged: function () { },
            onAddressTapped: function () { }
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
                console.log(response);
                vm.est = response;
            });
        }

        function _addProductToEstimate(product) {

        }

        $scope.$on("$fpm:onProductSelected", function ($emit, product) {
            if (product) { 
                _addProductToEstimate(product);
            }
        })

        $scope.$on("$fpm:closeProductSearchModal", function () {
            vm.productSearchModal.hide();
        })

        function activateController() {
            _getEstimateDetails();
        }

        activateController();
    }
    _initController.$inject = ["$scope", "$state", "$stateParams", "$timeout", "estimates-factory", "shared-data-factory", "fpm-utilities-factory", "authenticationFactory"];
    angular.module("fpm").controller("edit-estimate-controller", _initController);
})();