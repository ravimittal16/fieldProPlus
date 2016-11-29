(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            barcode: "<",
            uin: "<",
            displayName: "<"
        },
        controller: ["$scope", "$ionicActionSheet", "equipment-factory", "shared-data-factory", "custom-types-factory",
            "authenticationFactory", "fpm-utilities-factory",
            function ($scope, $ionicActionSheet, equipmentFactory, sharedDataFactory, customTypesFactory, authenticationFactory, fpmUtilitiesFactory) {
                var vm = this;
                vm.customTypesFactory = customTypesFactory;
                vm.userInfo = null;
                var alerts = fpmUtilitiesFactory.alerts;
                vm.view = {
                    currentActiveIndex: -1,
                    currentEquip: null,
                    barcodeEquipments: [],
                    notes: [],
                    gettingEquipements: true,
                    attachEquipmentsModal: null,
                    equipments: [],
                    newEquipmentModal: null,
                    newEquipmentEntity: null,
                    equipmentHistoryModal: null
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
                            if (vm.view.currentEquip) {
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
                    vm.view.gettingEquipements = true;
                    vm.view.barcodeEquipments = [];
                    fpmUtilitiesFactory.showLoading().then(function () {
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
                        }).finally(fpmUtilitiesFactory.hideLoading);
                    });
                }

                function openAttachEquipmentModal() {
                    if (vm.view.equipments.length === 0) {
                        fpmUtilitiesFactory.showLoading().then(function () {
                            equipmentFactory.getEquipmentsByUin(vm.uin).then(function (response) {
                                if (response && angular.isArray(response) && response.length === 0) {
                                    fpmUtilitiesFactory.hideLoading();
                                    return;
                                }
                                vm.view.equipments = response;
                                fpmUtilitiesFactory.getModal("attachEquipmentModal.html", $scope).then(function (modal) {
                                    vm.view.attachEquipmentsModal = modal;
                                    vm.view.attachEquipmentsModal.show();
                                });
                            }).finally(fpmUtilitiesFactory.hideLoading);
                        });
                    } else {
                        if (vm.view.attachEquipmentsModal === null) {
                            fpmUtilitiesFactory.getModal("attachEquipmentModal.html", $scope).then(function (modal) {
                                vm.view.attachEquipmentsModal = modal;
                                vm.view.attachEquipmentsModal.show();
                            });
                        } else {
                            vm.view.attachEquipmentsModal.show();
                        }
                    }

                }

                function deleteEquipmentClicked() {
                    if (vm.view.currentEquip) {
                        var equip = angular.copy(vm.view.currentEquip);
                        alerts.confirm("Confirmation!", "Are you sure?", function () {
                            fpmUtilitiesFactory.showLoading().then(function () {
                                equipmentFactory.unattachEquipToBarcode(vm.barcode, equip.num).then(function (response) {
                                    if (response === true) {
                                        alerts.alert("Success", "Equipment unattached successfully", function () {
                                            getEquipmentsByBarcode(true, false);
                                        });
                                    }
                                }).finally(fpmUtilitiesFactory.hideLoading);
                            });
                        });
                    }
                }
                function showMaintenanceHistory() {
                    vm.uiResult = [];
                    if (vm.view.currentEquip) {
                        if (vm.view.equipmentHistoryModal === null) {
                            fpmUtilitiesFactory.getModal("equipmentHistoryModal.html", $scope).then(function (modal) {
                                vm.view.equipmentHistoryModal = modal;
                            });
                        }
                        fpmUtilitiesFactory.showLoading().then(function () {
                            equipmentFactory.getEquipmentHistory(vm.view.currentEquip.num).then(function (response) {
                                if (response) {
                                    vm.result = response;
                                    if (vm.result.barcodes.length > 0) {
                                        angular.forEach(vm.result.barcodes, function (barcode) {
                                            var fields = _.filter(vm.result.fields, function (f) {
                                                return barcode.num === parseInt(f.entityKey, 10);
                                            });
                                            if (fields.length > 0) {
                                                vm.uiResult.push({ barcodeView: barcode, fields: fields });
                                            }
                                        });
                                    }
                                }
                            }).finally(function () {
                                vm.view.equipmentHistoryModal.show();
                                fpmUtilitiesFactory.hideLoading();
                            });
                        });
                    }
                }
                var newEquipemtSchama = { num: 0, displayName: vm.displayName, numFromCustomerFile: 0, equipmentNumber: "", description: "", uin: vm.uin, customTypesJson: "" };
                function createNewEquipment() {
                    vm.view.errors = [];
                    vm.view.newEquipmentEntity = angular.copy(newEquipemtSchama);
                    if (vm.view.newEquipmentModal === null) {
                        fpmUtilitiesFactory.getModal("newEquipmentModal.html", $scope).then(function (modal) {
                            vm.view.newEquipmentModal = modal;
                            vm.view.newEquipmentModal.show();
                        });
                    } else {
                        vm.view.newEquipmentModal.show();
                    }
                }
                var defaultCustomTypes = [{ EntityId: 0, EntityType: 101, UIOrder: 1, Title: "Maintenance Note", Type: 6 },
                { EntityId: 0, EntityType: 101, UIOrder: 2, Title: "Performed Date", Type: 4 }];
                vm.events = {
                    closeHistoryModal: function () {
                        if (vm.view.equipmentHistoryModal) {
                            vm.view.equipmentHistoryModal.hide();
                        }
                    },
                    createEquipmentSubmit: function (isValid, saveAndAttach) {
                        vm.view.errors = [];
                        var isFromEdit = vm.view.newEquipmentEntity.num !== 0;
                        if (vm.view.newEquipmentEntity.num === 0) {
                            vm.view.newEquipmentEntity.customTypesJson = JSON.stringify(defaultCustomTypes);
                        }
                        fpmUtilitiesFactory.showLoading("creating equipment..").then(function () {
                            equipmentFactory.createNewEquipment(vm.uin, vm.view.newEquipmentEntity, vm.barcode, saveAndAttach).then(function (response) {
                                if (response != null && angular.isArray(response)) {
                                    vm.data.errors = response;
                                } else {
                                    alerts.alert("Success!", "Equipment " + (isFromEdit ? "updated" : "created") + " successfully", function () {
                                        vm.view.newEquipmentModal.hide();
                                        getEquipmentsByBarcode(false);
                                    });
                                }
                            }).finally(fpmUtilitiesFactory.hideLoading)
                        });
                    },
                    closeNewEquipmentModal: function () {
                        if (vm.view.newEquipmentModal) {
                            vm.view.newEquipmentModal.hide();
                        }
                    },
                    closeEquipmentAttachModal: function () {
                        vm.view.attachEquipmentsModal.hide();
                    },
                    onAttachEquipmentItemClicked: function (equip) {
                        vm.view.errors = [];
                        fpmUtilitiesFactory.showLoading().then(function () {
                            equipmentFactory.attachEquipToBarcode(vm.barcode, equip.num).then(function (response) {
                                if (response !== null && angular.isArray(response)) {
                                    vm.view.errors = response;
                                } else {
                                    alerts.alert("Success", "Equipment attached to work order successfully.", function () {
                                        getEquipmentsByBarcode(false, true);
                                    });
                                }
                            }).finally(fpmUtilitiesFactory.hideLoading);
                        });
                    },
                    onActionDotsClicked: function () {
                        $ionicActionSheet.show({
                            buttons: [
                                { text: "Attach Equipment" },
                                { text: "Unattach Equipment" },
                                { text: "Show Maintenance History" },
                                { text: "Create New Equipment" }
                            ],
                            titleText: 'Equipment Options',
                            cancelText: 'Cancel',
                            cancel: function () {
                                // add cancel code..
                            },
                            buttonClicked: function (index) {
                                if (index === 0) openAttachEquipmentModal();
                                if (index === 1) deleteEquipmentClicked();
                                if (index === 2) showMaintenanceHistory();
                                if (index === 3) createNewEquipment();
                                return true;
                            }
                        });
                    },
                    onEquimentNextPreButtonClicked: function (isFromNext) {
                        var i = vm.view.currentActiveIndex;
                        i = isFromNext === true ? (i + 1) : (i - 1);
                        if (i > vm.view.barcodeEquipments.length - 1) {
                            i = 0;
                        }
                        if (i < 0) {
                            i = vm.view.barcodeEquipments.length - 1;
                        }
                        getEquipmentByIndex(i, true);
                    }
                }

                vm.$onInit = function () {
                    vm.userInfo = authenticationFactory.getLoggedInUserInfo();
                    getEquipmentsByBarcode();
                }
                vm.$onDestroy = function () {
                    vm.view.attachEquipmentsModal = null;
                }
            }],
        controllerAs: "vm",
        templateUrl: "js/equipments/equipments-list-component-template.html"
    };
    angular.module("fpm").component("equipmentsListComponent", componentConfig);
})();