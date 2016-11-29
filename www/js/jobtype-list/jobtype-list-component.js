(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            barcode: "<",
            jobtype: "<"
        },
        controller: ["$scope", "$timeout", "custom-types-factory", function ($scope, $timeout, customTypesFactory) {
            var vm = this;
            vm.factory = customTypesFactory;
            var controlTypes = customTypesFactory.controlTypes;
            vm.isExpanded = false;
            var counter = 0;
            vm.customTypes = {
                data: []
            };
            function updateToDatabase(type, dateType) {
                var o = angular.copy(type);
                var cbox = false;
                if (dateType && o.value) {
                    o.value = kendo.toString(kendo.parseDate(type.value), "g");
                }
                if (type.type === 3) {
                    cbox = type.value;
                }
                o.dataEntityType = 1;
                o.entityKey = vm.barcode;
                customTypesFactory.updateData(o, cbox).then(function (response) {
                    if (response) {
                        type.id = response.id;
                     }
                });
            }
            vm.events = {
                onValueChanged: function (type) {
                    if (type.type === 4) {
                        if (counter === 0) {
                            updateToDatabase(type, true);
                            counter++;
                        } else {
                            counter = 0;
                        }
                    } else {
                        updateToDatabase(type);
                    }
                }
            };
            vm.$onInit = function () {
                vm.customTypes.data = [];
                vm.factory.viewData = [];
                vm.factory.requestDataCompleted = false;
                if (vm.jobtype === null) {
                    vm.factory.requestDataCompleted = true;
                    return;
                }
                customTypesFactory.getCustomTypesDataByBarcode(vm.barcode, vm.jobtype)
                    .then(function (response) {
                        if (response && response.length > 0) {
                            var checkBoxes = _.where(response, { type: controlTypes.CHECKBOX });
                            angular.forEach(checkBoxes, function (e) {
                                e.value = (e.value === "true" || e.value === "True" || e.value === "1");
                            });
                            vm.customTypes.data = response;
                            vm.factory.viewData = vm.customTypes.data;
                        }
                        vm.factory.requestDataCompleted = true;
                    });
            }
        }],
        controllerAs: "vm",
        templateUrl: "js/jobtype-list/jobtype-list-component-template.html"
    };
    angular.module("fpm").component("jobtypeListComponent", componentConfig);
})();