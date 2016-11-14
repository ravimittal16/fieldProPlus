(function () {
    "use strict";
    angular.module("fpm").filter("totalTimeDiff", function () {
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
})();