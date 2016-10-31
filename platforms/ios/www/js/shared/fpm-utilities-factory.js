(function () {
    "use strict";
    function initFactory($cordovaDialogs, $q, $ionicPopup, $ionicModal) {
        return {
            toStringDate: function (date) {
                //return moment(date).format("MM/DD/YYYY h:mm a");
                return moment(date).format("lll");
            },
            alerts: {
                alert: function () {

                },
                confirm: function () {

                },
                confirmDelete: function (okCallback) {
                    var confirmPopup = $ionicPopup.confirm({
                        title: "Confirmation",
                        template: 'Are you sure?'
                    });
                    confirmPopup.then(function (res) {
                        if (res) {
                            if (angular.isFunction(okCallback)) {
                                okCallback();
                            }
                        }
                    });
                }
            }
        };
    }
    initFactory.$inject = ["$cordovaDialogs", "$q", "$ionicPopup", "$ionicModal"];
    angular.module("fpm").factory("fpm-utilities-factory", initFactory);
})();