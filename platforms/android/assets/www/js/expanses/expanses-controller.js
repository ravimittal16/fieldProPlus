(function () {
    "use strict";
    function initController($scope, $ionicLoading, $ionicPopup, expenseDataFactory) {
        var vm = this;
        function loadExpenses() {
            expenseDataFactory.getExpense("", true).then(function (response) {
                vm.expenses = response;
            });
        }
        function activateController() {
            loadExpenses();
        }
        function onDeleteClicked(item) {
            var confirmPopup = $ionicPopup.confirm({
                title: "Delete Expense",
                template: 'Are you sure?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    console.log("HELLO WORLD");
                }
            });
        }
        function onEditClicked(item) {

        }
        vm.events = {
            onDeleteClicked: onDeleteClicked,
            onEditClicked: onEditClicked
        };
        $scope.$on("$ionicView.loaded", function (event, data) {
            activateController();
        });
    }
    initController.$inject = ["$scope", "$ionicLoading", "$ionicPopup", "expense-data-factory"];
    angular.module("fpm").controller("expanses-controller", initController);
})();