(function () {
    "use strict";
    angular.module("fpm").filter("timeSpan", function () {
        return function (st, ft) {
            if (Date.parse(st) && Date.parse(ft)) {
                var totalMintues = moment(ft).diff(kendo.parseDate(st), "minutes");
                var hours = Math.floor(totalMintues / 60);
                var mintues = totalMintues % 60;
                if (hours > 0) {
                    return hours + " hrs " + mintues + " min";
                } else {
                    return mintues + " min";
                }
            }
            return "";
        };
    });
})();