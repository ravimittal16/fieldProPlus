(function () {
    "use strict"
    function initDirective() {
        return {
            link: function (scope, element, attrs) {
                $("#noImageMessageContainer").hide();
                $(element).on("error", function () {
                    $(element).hide();
                    $("#noImageMessageContainer").show();
                });
            }
        }
    }
    angular.module("fpm").directive("imageSrcCheck", initDirective);
})();