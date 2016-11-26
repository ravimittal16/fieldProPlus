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
                        console.log("RES", response);
                    });
                }
            }

            vm.$onChanges = function () {
                if (vm.entityId) {
                    getCustomTypesDataByEquipment();
                }
            }
        }],
        controllerAs: "vm",
        templateUrl: "js/equipments/equipment-custom-type-list-component-template.html"
    });
})();