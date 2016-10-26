(function () {
    "use strict";
    function initFactory($cordovaDialogs, $ionicPopup) {
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
                    // $cordovaDialogs.alert('message', 'title', 'button name')
                    //     .then(function () {
                    //         // callback success
                    //     });
                    // $cordovaDialogs.confirm('Confirmation', 'Are you sure?', ['Cancel', 'Okay'])
                    //     .then(function (buttonIndex) {
                    //         // no button = 0, 'OK' = 1, 'Cancel' = 2
                    //         var btnIndex = buttonIndex;
                    //     });
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
    initFactory.$inject = ["$cordovaDialogs", "$ionicPopup"];
    angular.module("fpm").factory("fpm-utilities-factory", initFactory);
})();