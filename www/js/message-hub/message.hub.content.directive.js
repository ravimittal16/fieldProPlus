(function () {
    "use strict";
    function _initDirective($timeout) {
        var VALIDTAGS = ["@wo", "@sch"];
        return {
            restrict: "A",
            bindToController: true,
            link: function (scope, element, attrs) {
                var isLastElement = attrs["messageContentFormatter"] === "true";
                $timeout(function () {
                    var elText = $(element).text();
                    var matchedTags = elText.match(/@\w+:\w+/g);
                    if (matchedTags && matchedTags.length > 0) {
                        _.forEach(matchedTags, function (tag, index) {
                            var firstPart = tag.split(":")[0];
                            if (
                                VALIDTAGS.indexOf(firstPart.toLowerCase()) > -1
                            ) {
                                elText = elText.replace(
                                    tag,
                                    "<span class='tag'>" + tag + "</span>"
                                );
                            }
                            if (index === matchedTags.length - 1) {
                                $(element).html(elText);
                            }
                        });
                    }
                }, 50);
                if (isLastElement) {
                    var $containerEl = $("#chat-content")[0];
                    $timeout(function () {
                        $("#chat-content").animate(
                            {
                                scrollTop: $containerEl.scrollHeight
                            },
                            500
                        );
                    }, 200);
                }
            }
        };
    }
    _initDirective.$inject = ["$timeout"];
    angular.module("fpm").directive("messageContentFormatter", _initDirective);
})();
