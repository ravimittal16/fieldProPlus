(function () {
    "use strict";
    function initDirective(authenticationFactory, localStorageService, fieldPromaxConfig) {
        return {
            link: function (scope, element, attrs) {
                var secLevels = fieldPromaxConfig.secLevels;
                var userData = authenticationFactory.getLoggedInUserInfo();
                if (angular.isDefined(scope.basedOn)) {
                    element.hide();
                    var basedOn = userData[scope.basedOn];
                    if (basedOn === true) {
                        element.show();
                    }
                } else {
                    if (scope.isConfigurationBased === false && scope.hideFor === userData.secLevel) {
                        element.hide();
                    }
                    if (scope.isConfigurationBased === true && userData.secLevel === secLevels.ServiceProvider) {
                        var configurations = localStorageService.get("configurations");
                        if (configurations) {
                            var propValue = configurations[scope.configProperty];
                            if (propValue === true) {
                                element.show();
                            } else {
                                element.hide();
                            }
                        }
                    }
                }
            },
            restrict: "A",
            scope: {
                isConfigurationBased: "=",
                configProperty: "=",
                hideFor: "=",
                basedOn: "="
            }
        };
    }
    initDirective.$inject = ["authenticationFactory", "localStorageService", "fieldPromaxConfig"];
    angular.module("fpm").directive("setElementVisibilityForRole", initDirective);
})();