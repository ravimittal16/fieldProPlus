(function () {
    "use strict";
    function initController(
        $timeout,
        $state,
        messageHubFactory,
        authenticationFactory,
        sharedDataFactory
    ) {
        var vm = this;
        vm.isLoading = true;
        vm.chatHistoryList = [];
        vm.allUsersList = [];

        vm.events = {
            onHeaderButtonClicked: function () {
                console.log("GE");
            },
            onUserItemClicked: function (user) {
                console.log(user);
                $state.go("app.messageHubDetails", { sender: user.userId });
            }
        };

        function __processUIData(users, messages) {
            var totalMessages = messages.collection;
            if (users && totalMessages && totalMessages.length > 0) {
                var __listOfUsers = _.filter(users, function (user) {
                    return user.num !== vm.user.userNum;
                });
                var __content = "";
                angular.forEach(__listOfUsers, function (user) {
                    var _userNum = +user.num;
                    var __messages = totalMessages.filter(function (message) {
                        return (
                            message.sentBy === _userNum ||
                            message.sentTo === _userNum
                        );
                    });
                    if (__messages.length > 0) {
                        __content = __messages[0].content;
                        vm.chatHistoryList.push({
                            userName: user.text,
                            lastMessageContent: __content,
                            userId: _userNum
                        });
                    }
                });
            }
        }

        function __fetchChatHistory() {
            vm.isLoading = true;
            messageHubFactory
                .loadChatHistory()
                .then(function (response) {
                    __processUIData(vm.allUsersList, response);
                })
                .finally(function () {
                    vm.isLoading = false;
                });
        }

        function __initialData() {
            messageHubFactory
                .getUserGroupsForScheduler()
                .then(function (response) {
                    if (response) {
                        vm.allUsersList = _.flatten(
                            _.compact(
                                _.map(response.userWorkGroups, function (item) {
                                    return item.userList;
                                })
                            )
                        );
                    }
                })
                .finally(function () {
                    $timeout(function () {
                        __fetchChatHistory();
                    }, 10);
                });
        }

        function __activateController() {
            vm.user = authenticationFactory.getLoggedInUserInfo();
            __initialData();
        }

        __activateController();
    }
    initController.$inject = [
        "$timeout",
        "$state",
        "message.hub.factory",
        "authenticationFactory",
        "shared-data-factory"
    ];
    angular
        .module("fpm")
        .controller("message-hub-page-controller", initController);
})();
