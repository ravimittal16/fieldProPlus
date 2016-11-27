(function () {
    "use strict";
    angular.module("fpm").component("equipmentCustomTypeListComponent", {
        bindings: {
            barcode: "<",
            entityId: "<"
        },
        controller: ["equipment-factory", "custom-types-factory", function (equipmentFactory, customTypesFactory) {
            var vm = this;
            vm.factory = customTypesFactory;
            vm.customTypes = {
                data: []
            };

            function getCustomTypesDataByEquipment() {
                vm.customTypes.data = [];
                vm.factory.viewDataForEquipment = [];
                if (angular.isDefined(vm.entityId) && angular.isDefined(vm.barcode)) {
                    equipmentFactory.getEquipmentFields(vm.entityId, vm.barcode).then(function (response) {
                        if (response && response.length > 0) {
                            var checkBoxes = _.where(response, { type: 3 });
                            angular.forEach(checkBoxes, function (e) {
                                e.value = (e.value === "true" || e.value === "True" || e.value === "1");
                            });
                            vm.customTypes.data = response;
                            vm.factory.viewDataForEquipment = vm.customTypes.data;
                        }
                    });
                }
            }

            vm.events = {
                onValueChanged: function (ct) {
                    
                }
            }

            vm.$onChanges = function () {
                if (vm.entityId) {
                    getCustomTypesDataByEquipment();
                }
            }
            vm.$onInit = function () {
                if (vm.entityId) {
                    getCustomTypesDataByEquipment();
                }
            }
        }],
        controllerAs: "vm",
        templateUrl: "js/equipments/equipment-custom-type-list-component-template.html"
    });
})();