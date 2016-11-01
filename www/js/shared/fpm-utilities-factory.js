(function () {
    "use strict";
    function initFactory($cordovaDialogs, $q, $ionicPopup, $ionicModal) {
        return {
            toStringDate: function (date) {
                //return moment(date).format("MM/DD/YYYY h:mm a");
                return moment(date).format("lll");
            },
            alerts: {
                alert: function (title, template, callback) {
                    var alertPopUp = $ionicPopup.alert({ title: title, template: template });
                    if (angular.isFunction(callback)) {
                        alertPopUp.then(function (res) {
                            callback();
                        });
                    }
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


    function initRemoveExtension() {
        return function (i) {
            var o = i.substr(i.lastIndexOf("/") + 1);
            var imageName = o.substr(0, o.lastIndexOf(".")) || "";
            return imageName;
        }
    }

    angular.module("fpm").filter("removeExt", [initRemoveExtension]);
})();