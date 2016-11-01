(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            padEventsRef: "="
        },
        templateUrl: "js/work-orders/order-signature-pad-template.html",
        controller: ["$scope", "$stateParams", "$q", "work-orders-factory",
            function ($scope, $stateParams, $q, workOrdersFactory) {
                var vm = this;
                vm.customerName = "";
                var barcode = $stateParams.barCode;
                vm.events = {
                    trySaveSignature: function () {
                        var defer = $q.defer();
                        var isFromEstimates = false;
                        var sign = $(angular.element("#signature")).jSignature("getData", "image");
                        if ($.trim(vm.customerName) !== "" && angular.isArray(sign)) {
                            workOrdersFactory.saveJsonSignForBarcode({ BaseString: sign[1], Barcode: (isFromEstimates ? "" : barcode), CustomerName: vm.customerName, EstimateId: 0 }).then(function () {
                                defer.resolve(true);
                            });
                        }
                        return defer.promise;
                    }
                };
                vm.$onInit = function () {
                    var $padElement = angular.element("#signature");
                    $($padElement).jSignature({ lineWidth: 1, width: $(document).width() - 80, height: 200, 'decor-color': "transparent" }).bind("change", function (e) {
                        var data = $($padElement).jSignature("getData", "image");
                        if (angular.isArray(data)) {

                        }
                    });
                    vm.padEventsRef = vm.events;
                }
            }],
        controllerAs: "vm"
    };
    angular.module("fpm").component("orderSignaturePad", componentConfig);
})();