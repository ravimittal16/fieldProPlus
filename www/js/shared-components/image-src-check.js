(function() {
  "use strict";
  function initDirective($timeout) {
    return {
      link: function(scope, element, attrs) {
        $timeout(function() {
          scope.$emit("fpm:showEmptyImageMessage", false);
          $(element).on("error", function() {
            $(element).hide();
            scope.$emit("fpm:showEmptyImageMessage", true);
          });
        }, 200);
      }
    };
  }
  initDirective.$inject = ["$timeout"];
  angular.module("fpm").directive("imageSrcCheck", initDirective);
})();
