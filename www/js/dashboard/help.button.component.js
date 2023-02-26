(function () {
    "use strict";

    function _componentController($scope, $ionicModal) {
        var vm = this;
        var isDestryed = false;
        vm.events = {
            onHelpButtonClicked: openModal
        };
        vm.modal = null;

        function openModal() {
            initModal(true);
        }

        $scope.$on("$fp.onQuestionModalClosedClicked", function () {
            vm.modal.hide();
            vm.modal.remove();
            vm.modal = null;
            isDestryed = true;
        });

        vm.$onDestroy = function () {
            vm.modal.remove();
            vm.modal = null;
            isDestryed = true;
        };

        function initModal(openModal) {
            $ionicModal
                .fromTemplateUrl("helpModalTemplate.html", {
                    scope: $scope,
                    animation: "slide-in-up",
                    focusFirstInput: true
                })
                .then(function (modal) {
                    vm.modal = modal;
                    if (openModal) {
                        vm.modal.show();
                    }
                });
        }

        vm.$onInit = function () {
            initModal(false);
        };
    }

    _componentController.$inject = ["$scope", "$ionicModal"];

    angular.module("fpm").component("helpButtonComponent", {
        controller: _componentController,
        controllerAs: "vm",
        templateUrl: "js/dashboard/help.button.component.html"
    });
})();
