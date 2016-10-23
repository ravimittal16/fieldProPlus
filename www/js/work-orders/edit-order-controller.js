(function () {
    "use strict";
    function initController($scope, $state, $stateParams, $ionicActionSheet, $ionicLoading, $ionicPopup, workOrderFactory) {
        var vm = this;
        vm.barcode = $stateParams.barCode;

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
        vm.events = {
            showActionSheet: showActionSheet
        };
    }
    initController.$inject = ["$scope", "$state", "$stateParams", "$ionicActionSheet", "$ionicLoading", "$ionicPopup", "work-orders-factory"];
    angular.module("fpm").controller("edit-order-controller", initController);
})();