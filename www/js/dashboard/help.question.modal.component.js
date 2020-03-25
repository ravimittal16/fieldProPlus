(function() {
  "use strict";

  function _componentController(
    $scope,
    $ionicPlatform,
    sharedDataFactory,
    fpmUtilitiesFactory
  ) {
    var vm = this;
    vm.data = {
      posting: false,
      showSuccessMessage: false,
      entity: {
        question: "",
        description: "",
        fromMobile: true
      }
    };
    var alerts = fpmUtilitiesFactory.alerts;
    vm.events = {
      onSubmitClicked: function(isValid) {
        vm.data.posting = true;
        var _m = vm.data.entity;
        _m.fromMobile = true;
        if (isValid) {
          sharedDataFactory.submitQuestion(_m).then(function(response) {
            alerts.alert(
              "Success!",
              "Your question has been submitted successfully. We will get back to you shortly."
            );

            vm.data.posting = false;
            vm.events.closePopoutModal();
          });
        }
      },
      closePopoutModal: function() {
        if (vm.modalwindow) {
          vm.modalwindow.hide();
        } else {
          $scope.$emit("$fp.onQuestionModalClosedClicked", {
            _dt: new Date()
          });
        }
        vm.data.posting = false;
        vm.data.entity.question = "";
        vm.data.entity.description = "";
      }
    };
    vm.$onDestroy = function() {
      $ionicPlatform.offHardwareBackButton(function() {});
    };
    vm.$onInit = function() {
      $ionicPlatform.registerBackButtonAction(function(event) {
        vm.event.closePopoutModal();
      });
    };
  }

  _componentController.$inject = [
    "$scope",
    "$ionicPlatform",
    "shared-data-factory",
    "fpm-utilities-factory"
  ];

  angular.module("fpm").component("helpQuestionModalComponent", {
    bindings: {
      modalwindow: "<"
    },
    controller: _componentController,
    controllerAs: "vm",
    templateUrl: "js/dashboard/help.question.modal.component.html"
  });
})();
