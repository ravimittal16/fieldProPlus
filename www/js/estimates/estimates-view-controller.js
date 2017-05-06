(function () {
    "use strict";
    function _initController($scope, $state, estimatesFactory, fpmUtilities) {
        var vm = this;
        vm.processing = true;
        function _getEstimates(callback) {
            vm.processing = true;
            fpmUtilities.showLoading("Loading estimates...");
            estimatesFactory.getAllEstimates().then(function (response) {
                vm.estimates = response;
                vm.processing = false;
                if (angular.isFunction(callback)) {
                    callback();
                }
            }).finally(fpmUtilities.hideLoading);
        }

        function onDeleteClicked(estimate) {

        }

        function onEditClicked(estimate) {
            $state.go("app.editEstimate", { id: estimate.estimateId });
        }

        function onCreateEstimateClicked() {
            $state.go("app.createEstimate");
        }
        vm.events = {
            refreshOnPullDown: function () {
                _getEstimates(function () {
                    $scope.$broadcast("scroll.refreshComplete");
                });
            },
            onCreateEstimateClicked: onCreateEstimateClicked,
            onDeleteClicked: onDeleteClicked,
            onEditClicked: onEditClicked
        };
        function activateController() {
            _getEstimates(null);
        }
        $scope.$on("$ionicView.afterEnter", function (e, data) {
            activateController();
        });
    }

    _initController.$inject = ["$scope", "$state", "estimates-factory", "fpm-utilities-factory"]
    angular.module("fpm").controller("estimates-view-controller", _initController);

})()