(function () {
    "use strict";
    function __initFactory(apicontext, $rootScope, $q, $cacheFactory) {
        var baseUrl = "api/messagehub/";
        var cache = $cacheFactory("messageHub");
        var __service = {};
        function loadChatHistory() {
            return apicontext.get(baseUrl + "GetAllMessagesToOrFromSender");
        }
        function getUserGroupsForScheduler() {
            var users = cache.get("users:list");
            if (angular.isDefined(users) && users) {
                return $q.when(users);
            } else {
                return apicontext
                    .get("api/Users/GetUserGroupsForScheduler")
                    .then(function (response) {
                        cache.put("users:list", response);
                        return response;
                    });
            }
        }
        function insertMessage(model) {
            return apicontext.post(baseUrl + "InsertMessage", model);
        }
        function getAllMessages(sender, receiverId) {
            return apicontext.get(
                baseUrl +
                    "GetAllMessages?senderId=" +
                    sender +
                    "&receiverId=" +
                    receiverId
            );
        }

        // ==========================================================
        // SERVICE METHODS
        // ==========================================================
        __service.insertMessage = insertMessage;
        __service.getAllMessages = getAllMessages;
        __service.getUserGroupsForScheduler = getUserGroupsForScheduler;
        __service.loadChatHistory = loadChatHistory;
        return __service;
    }
    __initFactory.$inject = [
        "api-base-factory",
        "$rootScope",
        "$q",
        "$cacheFactory"
    ];
    angular.module("fpm").factory("message.hub.factory", __initFactory);
})();
