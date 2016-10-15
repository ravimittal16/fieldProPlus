(function () {
    "use strict";
    function initController($scope, $state, $stateParams, $ionicActionSheet, workOrderFactory) {
        var vm = this;
        console.log($stateParams);
        vm.barcode = $stateParams.barCode;
        
        function getBarcodeDetails() {
            workOrderFactory.getBarcodeDetails(vm.barcode).then(function (response) {
                vm.barCodeData = response;
                console.log(response);
                if (angular.isArray(response.schedules)) {
                    var _scheduleFromFilter = _.filter(response.schedules, function(sch){
                        return sch.Num === parseInt($stateParams.technicianNum, 10); 
                    });
                    vm.schedule = angular.copy(_scheduleFromFilter[0]);
                }
            });
        }
        getBarcodeDetails();

        function showActionSheet() {
            console.log("HELO WORLD");
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
        vm.events = {
            showActionSheet: showActionSheet
        };
    }
    initController.$inject = ["$scope", "$state", "$stateParams", "$ionicActionSheet", "work-orders-factory"];
    angular.module("fpm").controller("edit-order-controller", initController);
})();