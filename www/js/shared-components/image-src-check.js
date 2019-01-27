(function () {
  "use strict";

  function initDirective($timeout) {
    return {
      link: function (scope, element, attrs) {
        scope.$emit("fpm:showEmptyImageMessage", false);
        $(element).on("error", function () {
          $timeout(function () {
            $(element).hide();
            $(element).parent().hide();
            scope.$emit("fpm:showEmptyImageMessage", true);
          }, 20);
        });
      }
    };
  }
  initDirective.$inject = ["$timeout"];
  angular.module("fpm").directive("imageSrcCheck", initDirective);
})();
