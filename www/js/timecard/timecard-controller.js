(function () {
    "use strict";
    function initController($scope, ionicDatePicker, $ionicPopover, $cordovaActionSheet, timecardFactory, fpmUtilitiesFactory) {
        var vm = this;
        var jobCodes = { CLOCK_IN: 5001, CLOCK_OUT: 5002 };

        var options = {
            title: 'What do you want with this image?',
            buttonLabels: ['Share via Facebook', 'Share via Twitter'],
            addCancelButtonWithLabel: 'Cancel',
            androidEnableCancelButton: true,
            winphoneEnableCancelButton: true,
            addDestructiveButtonWithLabel: 'Delete it'
        };

        var toDateString = fpmUtilitiesFactory.toStringDate;
        var statusTypes = {
            NONE: 0,
            SEND_FOR_APPROVAL: 1,
            CANCELLED: 2,
            APPROVED: 3
        };
        vm.errors = [];

        vm.currentDate = new Date();


        function _getTimeCardByDate() {
            //blockUi.start("Please wait...");
            //_clearClockInData();
            timecardFactory.getTimeCardByDate(toDateString(vm.currentDate)).then(function (response) {
                console.log(response);
                if (response) {
                    //_updateTimeCardBindings(response);
                } else {
                    //_checkIfPastDateSelected();
                }
            });
        }

        $ionicPopover.fromTemplateUrl('my-popover.html', {
            scope: $scope
        }).then(function (popover) {
            vm.popover = popover;
        });
        var datePickerConfig = {
            callback: function (val) {
                vm.currentDate = new Date(val);
                _getTimeCardByDate();
            },
            inputDate: vm.currentDate
        };

        function onDatePickerClicked() {
            ionicDatePicker.openDatePicker(datePickerConfig);
        }
        function showPopoverClicked($event) {
            //vm.popover.show($event);
            $cordovaActionSheet.show(options)
                .then(function (btnIndex) {
                    var index = btnIndex;
                });
        }
        vm.events = {
            onDatePickerClicked: onDatePickerClicked,
            showPopoverClicked: showPopoverClicked
        }
        console.log("HELLO WORLD");
    }
    initController.$inject = ["$scope", "ionicDatePicker", "$ionicPopover", "$cordovaActionSheet", "timecard-factory", "fpm-utilities-factory"];
    angular.module("fpm").controller("timecard-controller", initController);
})();