(function () {
    "use strict"
    var fpm = angular.module("fpm");
    fpm.directive("focusMe", ["$timeout", function ($timeout) {
        return {
            link: function (scope, element, attrs) {
                scope.$on("modal.shown", function () {
                    $timeout(function () {
                        element[0].focus();
                        if (ionic.Platform.isAndroid()) {
                            cordova.plugins.Keyboard.show();
                        }
                    }, 750);
                });
            }
        };
    }]);

    function _growTextbox() {
        return {
            link: function (scope, element, attrs) {
                setTimeout(function () {
                    $(element).autogrow({ vertical: true, horizontal: false });
                }, 1000);
            },
            restrict: "A"
        }
    }

    fpm.directive("autoGrow", _growTextbox);
})();