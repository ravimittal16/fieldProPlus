(function () {
    "use strict"
    angular.module("fpm").directive("focusMe", ["$timeout", function ($timeout) {
        return {
            link: function (scope, element, attrs) {
                scope.$on("modal.shown", function () {
                    $timeout(function () {
                        element[0].focus();
                        if (ionic.Platform.isAndroid()) {
                            cordova.plugins.Keyboard.show();
                        }
                    }, 500);
                });
            }
        };
    }]);
})();