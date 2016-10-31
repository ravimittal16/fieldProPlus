(function () {
    "use strict";
    var componentConfig = {
        templateUrl: "js/work-orders/order-signature-pad-template.html",
        controller: ["$scope", function ($scope) {
            var vm = this;
            vm.$onInit = function () {
                var $padElement = angular.element("#signature");
                $($padElement).jSignature({ lineWidth: 1, width: $(document).width() - 100, height: 200, 'decor-color': "transparent" }).bind("change", function (e) {
                    var data = $($padElement).jSignature("getData", "image");
                    if (angular.isArray(data)) {
                        $scope.$emit("sign:changed", data[1]);
                    }
                });
            }
        }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("orderSignaturePad", componentConfig);
})();