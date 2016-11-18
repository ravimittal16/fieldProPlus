(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            onCancelClicked: "&"
        },
        controller: ["$scope", "timecard-factory", function ($scope, timecardFactory) {
            var vm = this;
            vm.isCertifield = false;
            vm.info = null;
            function closeProductEditModal() {
                if (angular.isFunction(vm.onCancelClicked)) {
                    vm.onCancelClicked();
                }
            }
            function onCertifyClicked() {
                timecardFactory.certifyUser().then(function (response) {
                    if (response) {
                        vm.isCertifield = true;
                        vm.info = response;
                    }
                });
            }
            vm.events = { closeProductEditModal: closeProductEditModal, onCertifyClicked: onCertifyClicked };
            vm.$onInit = function () {
                timecardFactory.getCertifieldUser().then(function (response) {
                    if (response) {
                        vm.isCertifield = response.IsCertified || false;
                        vm.info = response;
                    }
                });
            }
        }],
        controllerAs: "vm",
        templateUrl: "js/timecard/timecard-tutorial-component.template.html"
    };
    angular.module("fpm").component("timecardTutorialViewComponent", componentConfig);
})();