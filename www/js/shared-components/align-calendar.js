(function() {
  "use strict";
  function initDirective() {
    return {
      link: function(scope, element, attrs) {
        if (attrs.class) {
          $(element[0].children[0]).css("text-align", "center");
        } else {
          $(element[0].children[0]).css("text-align", "right");
        }
      }
    };
  }

  angular.module("fpm").directive("alignCalendar", initDirective);
})();
