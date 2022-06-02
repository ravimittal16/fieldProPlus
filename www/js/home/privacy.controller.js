(function () {
    "use strict";
    function initController($scope, sharedDataFactory, fpmUtilities) {
        var vm = this;
        var alerts = fpmUtilities.alerts;
        vm.clearLocationDataClicked = function () {
            alerts.confirm(
                "Clear Location Data",
                "Are you sure?",
                function () {
                    sharedDataFactory.clearLocationData().then(function (data) {
                        alerts.alert(
                            "Success",
                            "Location information has been removed."
                        );
                    });
                },
                function () {}
            );
        };
    }
    initController.$inject = [
        "$scope",
        "shared-data-factory",
        "fpm-utilities-factory"
    ];
    angular.module("fpm").controller("privacy-controller", initController);
})();
