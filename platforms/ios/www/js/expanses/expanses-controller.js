(function () {
    "use strict";
    function initController($scope, $ionicLoading, $ionicModal, $ionicPopup, expenseDataFactory) {
        var vm = this;
        vm.paid = [];
        vm.unpaid = [];
        function loadExpenses() {
            expenseDataFactory.getExpense("", true).then(function (response) {
                vm.paid = _.filter(response, function (o) { return o.expenseStatus == 1 });
                vm.unpaid = _.filter(response, function (o) { return o.expenseStatus == 0 });
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
            console.log(vm.modal);
            vm.editedExpense = item;
            vm.modal.show();
        }
        vm.events = {
            onDeleteClicked: onDeleteClicked,
            onEditClicked: onEditClicked
        };
        $scope.$on("$ionicView.loaded", function (event, data) {
            activateController();
        });

        $ionicModal.fromTemplateUrl("expenseModal.html", {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            vm.modal = modal;
        });
    }
    initController.$inject = ["$scope", "$ionicLoading", "$ionicModal", "$ionicPopup", "expense-data-factory"];
    angular.module("fpm").controller("expanses-controller", initController);
})();