(function () {
  "use strict";
  var fpm = angular.module("fpm");
  fpm.filter("totalTimeDiff", function () {
    return function (list) {
      var totalTime = "0";
      if (list.length > 0) {
        var totalMins = 0;
        angular.forEach(list, function (e, i) {
          if (e.finishTime) {
            totalMins += moment(kendo.parseDate(e.finishTime)).diff(kendo.parseDate(e.startTime), "minutes");
          }
          if (i === list.length - 1 && totalMins > 0) {
            var hours = Math.floor(totalMins / 60);
            var mintues = totalMins % 60;
            return totalTime = hours + " hrs " + mintues + " min";
          }
        });
      }
      return totalTime;
    }
  });

  fpm.filter("toTimeFormat", function () {
    return function (num) {
      if (num) {
        var hours = (num / 60);
        var rhours = Math.floor(hours);
        var minutes = (hours - rhours) * 60;
        var rminutes = Math.round(minutes);
        return rhours + ":" + ('0' + rminutes).slice(-2);
      }
      return "0:00";
    }
  })
})();
