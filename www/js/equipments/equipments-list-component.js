(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            barcode: "<"
        },
        controller: ["$scope", "equipment-factory", "shared-data-factory", "custom-types-factory",
            "authenticationFactory", "fpm-utilities-factory",
            function ($scope, equipmentFactory, sharedDataFactory, customTypesFactory, authenticationFactory, fpmUtilitiesFactory) {
                var vm = this;
                vm.customTypesFactory = customTypesFactory;
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
                            fpmUtilitiesFactory.showLoading();
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
                            }).finally(fpmUtilitiesFactory.hideLoading);
                        } else {
                            vm.view.currentActiveIndex = index;
                            vm.view.currentEquip = vm.view.barcodeEquipments[index];
                        }
                    } else {
                        vm.view.currentActiveIndex = index;
                        vm.view.currentEquip = vm.view.barcodeEquipments[index];
                        console.log("vm.view.currentEquip", vm.view.currentEquip);
                    }
                }

                function getEquipmentsByBarcode(refreshArrayIndex, saveFields) {
                    if (refreshArrayIndex === true) {
                        vm.view.currentActiveIndex = -1;
                        vm.view.currentEquip = null;
                        vm.view.notes = [];
                    }
                    vm.view.gettingEquipements = true;
                    vm.view.barcodeEquipments = [];
                    equipmentFactory.getBarcodeEquipments(vm.barcode).then(function (response) {
                        vm.view.gettingEquipements = false;
                        if (angular.isArray(response)) {
                            vm.view.barcodeEquipments = response;
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

                vm.events = {
                    onEquimentNextPreButtonClicked: function (isFromNext) {
                        var i = vm.view.currentActiveIndex;
                        i = isFromNext === true ? (i + 1) : (i - 1);
                        if (i > vm.view.barcodeEquipments.length - 1) {
                            i = 0;
                        }
                        if (i < 0) {
                            i = vm.view.barcodeEquipments.length - 1;
                        }
                        console.log("vm.view.barcodeEquipments", vm.view.barcodeEquipments);
                        getEquipmentByIndex(i, true);
                    }
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