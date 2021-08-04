(function () {
    "use strict";
    function __componentController($timeout, $state, $scope) {
        var vm = this;
        vm.uiData = {
            newMessageCount: 11
        }

        vm.events = {
            onHeaderButtonClicked: function () {
                $state.go("app.messageHub");
            }
        }
        vm.$onInit = function () {
            console.log("HELLO WORLD")
        }
    }
    __componentController.$inject = ["$timeout", "$state", "$scope"];
    var componentConfig = {
        templateUrl: "js/message-hub/message.hub.header.component.html",
        controller: __componentController,
        controllerAs: "vm"
    };
    angular.module("fpm").component("messageHubHeaderButton", componentConfig);
})();