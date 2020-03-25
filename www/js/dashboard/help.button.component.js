(function() {
  "use strict";

  function _componentController($scope, $ionicModal) {
    var vm = this;
    var isDestryed = false;
    vm.events = {
      onHelpButtonClicked: openModal
    };
    vm.modal = {};

    function openModal() {
      if (isDestryed) {
        isDestryed = false;
        initModal();
      }
      if (vm.modal) {
        vm.modal.show();
      }
    }

    $scope.$on("$fp.onQuestionModalClosedClicked", function() {
      vm.modal.hide();
    });

    vm.$onDestroy = function() {
      vm.modal.remove();
      isDestryed = true;
    };

    function initModal() {
      $ionicModal
        .fromTemplateUrl("helpModalTemplate.html", {
          scope: $scope,
          animation: "slide-in-up",
          focusFirstInput: true
        })
        .then(function(modal) {
          vm.modal = modal;
        });
    }

    vm.$onInit = function() {
      initModal();
    };
  }

  _componentController.$inject = ["$scope", "$ionicModal"];

  angular.module("fpm").component("helpButtonComponent", {
    controller: _componentController,
    controllerAs: "vm",
    templateUrl: "js/dashboard/help.button.component.html"
  });
})();
