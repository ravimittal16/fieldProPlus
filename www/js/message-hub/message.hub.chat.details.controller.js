(function () {
    "use strict";
    function initController(
        $timeout,
        $state,
        $stateParams,
        messageHubFactory,
        authenticationFactory,
        sharedDataFactory
    ) {
        var vm = this;
        vm.isLoading = false;
        vm.messages = [];
        vm.messageContent = "";
        var senderId = $stateParams.sender;
        vm.events = {
            onSendMessageClicked: function (isvalid) {
                messageHubFactory
                    .insertMessage({
                        content: vm.messageContent,
                        sentToUser: senderId,
                        fromMobile: true
                    })
                    .then(function (response) {
                        if (response) {
                            vm.messageContent = "";
                        }
                    });
            },
            onBackButtonClicked: function () {
                $state.go("app.messageHub");
            }
        };
        function __activateController() {
            vm.isLoading = true;
            vm.user = authenticationFactory.getLoggedInUserInfo();
            messageHubFactory
                .getAllMessages(senderId, vm.user.userNum)
                .then(function (response) {
                    vm.messages = response.collection;
                })
                .finally(function () {
                    vm.isLoading = false;
                });
        }

        __activateController();
    }
    initController.$inject = [
        "$timeout",
        "$state",
        "$stateParams",
        "message.hub.factory",
        "authenticationFactory",
        "shared-data-factory"
    ];
    angular
        .module("fpm")
        .controller("message-hub-chat-details-controller", initController);
})();
