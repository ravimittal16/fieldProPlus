(function () {
    "use strict";
    angular.module("fpm").component("equipmentCustomTypeListComponent", {
        bindings: {
            barcode: "<",
            entityId: "<"
        },
        controller: ["equipment-factory", "custom-types-factory", "authenticationFactory",function (equipmentFactory, customTypesFactory,authenticationFactory) {
            var vm = this;
            vm.factory = customTypesFactory;
            var userInfo = authenticationFactory.getLoggedInUserInfo();
            vm.dateFormat= userInfo.dateFormat;
            vm.customTypes = {
                data: []
            };
            var counter = 0;
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
            function updateToDatabase(type) {
                var chbx = false;
                if (type.type === 3) {
                    chbx = type.value === true;
                }
                if (type.type === 4) {
                    type.value = kendo.toString(kendo.parseDate(type.value), "g");
                }
                //customTypesFactory.updateData(type, chbx);
                equipmentFactory.saveDataCustomTypes({ num: vm.entityId, barcode: vm.barcode, customTypesJson: JSON.stringify(vm.customTypes.data) });
            }
            vm.events = {
                onValueChanged: function (ct) {
                    if (ct.type === 4) {
                        if (counter === 0) {
                            updateToDatabase(ct);
                            counter++;
                        } else {
                            counter = 0;
                        }
                    } else {
                        updateToDatabase(ct);
                    }
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