(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            barcode: "<"
        },
        controller: ["$scope", "equipment-factory", "shared-data-factory", "authenticationFactory",
            function ($scope, equipmentFactory, sharedDataFactory, authenticationFactory) {
                var vm = this;
                vm.userInfo = null;
                vm.view = {
                    currentActiveIndex: -1,
                    currentEquip: null,
                    barcodeEquipments: [],
                    notes: [],
                    gettingEquipements: true
                };
                function getEquipmentByIndex(index, saveFields) {
                    if (saveFields === true) {
                        var equipCts = vm.customTypesFactory.viewDataForEquipment;
                        if (angular.isArray(equipCts) && equipCts.length > 0) {
                            var dates = _.where(equipCts, { type: 4 });
                            if (angular.isArray(dates)) {
                                angular.forEach(dates, function (eq) {
                                    if (eq.value) {
                                        eq.value = kendo.toString(kendo.parseDate(eq.value), "d");
                                    }
                                });
                            }
                            var equipCtsJson = JSON.stringify(equipCts);
                            equipmentFactory.saveDataCustomTypes({ num: vm.view.currentEquip.num, barcode: vm.barcode, customTypesJson: equipCtsJson }).then(function () {
                                vm.view.currentActiveIndex = index;
                                vm.view.currentEquip = vm.view.barcodeEquipments[index];
                            });
                        } else {
                            vm.view.currentActiveIndex = index;
                            vm.view.currentEquip = vm.view.barcodeEquipments[index];
                        }
                    } else {
                        vm.view.currentActiveIndex = index;
                        vm.view.currentEquip = vm.view.barcodeEquipments[index];
                    }
                }
                function getEquipmentsByBarcode(refreshArrayIndex, saveFields) {
                    if (refreshArrayIndex === true) {
                        vm.view.currentActiveIndex = -1;
                        vm.view.currentEquip = null;
                        vm.view.notes = [];
                    }
                    equipmentFactory.getBarcodeEquipments(vm.barcode).then(function (response) {
                        vm.view.barcodeEquipments = response;
                        vm.view.gettingEquipements = false;
                        if (angular.isArray(response)) {
                            if (vm.view.barcodeEquipments.length === 1) {
                                getEquipmentByIndex(0, saveFields);
                            } else {
                                if (vm.view.currentActiveIndex === -1) {
                                    getEquipmentByIndex(0, saveFields);
                                } else {
                                    getEquipmentByIndex(vm.view.currentActiveIndex, saveFields);
                                }
                            }
                        } else {
                            vm.view.currentActiveIndex = -1;
                            vm.view.currentEquip = null;
                        }
                    });
                }

                vm.$onInit = function () {
                    vm.userInfo = authenticationFactory.getLoggedInUserInfo();
                    getEquipmentsByBarcode();
                }
            }],
        controllerAs: "vm",
        templateUrl: "js/equipments/equipments-list-component-template.html"
    };
    angular.module("fpm").component("equipmentsListComponent", componentConfig);
})();