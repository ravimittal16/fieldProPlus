(function () {
    "use strict";
    angular.module("fpm").component("expanseListComponent", {
        bindings: {
            barcode: "<",
            refresher: "<"
        },
        controller: ["$scope", "$timeout", "$ionicActionSheet", "expense-data-factory", "fpm-utilities-factory",
            function ($scope, $timeout, $ionicActionSheet, expenseDataFactory, fpmUtilitiesFactory) {
                var vm = this;
                vm.paid = [];
                vm.unpaid = [];
                vm.expanses = [];
                vm.modal = null; var alerts = fpmUtilitiesFactory.alerts;
                var schema = { expenseId: 0, title: "", description: "", expenseType: 0, expenseStatus: 0, totalCost: 0, barcode: vm.barcode, expenseDate: new Date(), quantity: 1, imageChanged: false, havingImage: false, isReimbursable: false };
                vm.image = {
                    name: "",
                    visible: false
                };
                vm.requestCompleted = false;
                function loadExpenses(callback) {
                    vm.paid = [];
                    vm.unpaid = [];
                    vm.requestCompleted = false;
                    fpmUtilitiesFactory.showLoading().then(function () {
                        expenseDataFactory.getExpense(vm.barcode || "", true).then(function (response) {
                            if (response) {
                                vm.expanses = response;
                                vm.paid = _.filter(response, function (o) { return o.expenseStatus == 1 });
                                vm.unpaid = _.filter(response, function (o) { return o.expenseStatus == 0 });
                            }
                            vm.requestCompleted = true;
                        }).finally(function () {
                            if (angular.isFunction(callback)) {
                                callback();
                            }
                            fpmUtilitiesFactory.hideLoading();
                        });
                    });
                }
                function activateController() {
                    loadExpenses();
                }
                var deleteTimer = null;
                function onDeleteClicked(item, index, isFromPaid) {
                    alerts.confirmDelete(function () {
                        fpmUtilitiesFactory.showLoading().then(function () {
                            expenseDataFactory.deleteExpense(item.expenseId).then(function (response) {
                                if (response === true) {
                                    deleteTimer = $timeout(function () {
                                        alerts.alert("Deleted", "Expense deleted successfully", function () {
                                            vm.expanses.splice(index, 1);
                                        });
                                    }, 200)
                                }
                            }).finally(fpmUtilitiesFactory.hideLoading);
                        });
                    })
                }

                function openModal(entity) {

                    if (vm.modal === null) {
                        fpmUtilitiesFactory.getModal("expenseModal.html", $scope).then(function (modal) {
                            vm.modal = modal;
                            vm.entity = angular.copy(entity);
                            if (entity.expenseId !== 0) {
                                vm.entity.isReimbursable = entity.expenseType === 0;
                                vm.entity.havingImage = entity.imageName !== null;
                            } else {
                                vm.entity.havingImage = false;
                            }
                            vm.modal.show();
                        });
                    } else {
                        vm.entity = angular.copy(entity);
                        if (entity.expenseId !== 0) {
                            vm.entity.isReimbursable = entity.expenseType === 0;
                            vm.entity.havingImage = entity.imageName !== null;
                        } else {
                            vm.entity.havingImage = false;
                        }
                        vm.modal.show();
                    }

                }


                function onEditClicked(item) {
                    var exp = angular.copy(item);
                    exp.isReimbursable = false;
                    openModal(exp);
                }
                function addNewExpanse() {
                    openModal(angular.copy(schema));
                }
                function onActionDotsClicked() {
                    addNewExpanse();
                }
                function uploadImage(mappedImage, imageName) {
                    vm.entity.imageChanged = true;
                    vm.entity.imageModel = { image: mappedImage, name: imageName };
                }
                vm.upload = {
                    control: null,
                    config: {
                        multiple: false,
                        showFileList: false,
                        localization: {
                            select: "upload the receipt"
                        },
                        select: function (e) {
                            e.isDefaultPrevented = true;
                            var exts = ["tif", "tiff", "gif", "jpeg", "jpg", "jif", "jfif", "jp2", "jpx", "j2k", "j2c", "pcd", "png", "bmp"];
                            var extension = e.files[0].name.split(".");
                            var getExt = extension.reverse();
                            if (e.files[0].size > 20 * 1024 * 1024) {
                                alerts.alert("Warning", "This file is too big.Max size is 20 MB");
                                return;
                            }
                            $scope.$apply(function () {
                                vm.image.name = e.files[0].name;
                                vm.image.visible = true;
                            });
                            if ($.inArray(getExt[0].toLowerCase(), exts) < 0) {
                                alerts.alert("Warning", "Invalid image file extension ( ." + getExt[0] + " ). Please upload only image file.");
                                return;
                            }
                            console.log("e", e);
                            var fileReader = new FileReader();
                            fileReader.onload = function (event) {
                                var mapImage = event.target.result;
                                uploadImage(mapImage, e.files[0].name);
                            };
                            fileReader.readAsDataURL(e.files[0].rawFile);
                        }
                    }
                };
                function closeModal() {
                    vm.modal.hide();
                }
                vm.errors = [];
                function onSubmitClicked(isValid) {
                    vm.errors = [];
                    if (isValid === true) {
                        vm.entity.expenseType = vm.entity.isReimbursable === true ? 0 : 1;
                        vm.entity.expenseDate = kendo.toString(kendo.parseDate(vm.entity.expenseDate), "g");

                        fpmUtilitiesFactory.showLoading().then(function () {
                            expenseDataFactory.addExpense(vm.entity).then(function (response) {
                                if (response) {
                                    vm.modal.hide();
                                    loadExpenses(fpmUtilitiesFactory.hideLoading);
                                }
                            });
                        });
                    } else {
                        vm.errors.push("Invalid Save: Please check all values before save");
                    }
                }
                function refreshOnPullDown() {
                    loadExpenses(function () {
                        $scope.$broadcast("scroll.refreshComplete");
                    });
                }
                vm.$onDestroy = function () {
                    $timeout.cancel(deleteTimer);
                }
                vm.events = {
                    refreshOnPullDown: refreshOnPullDown,
                    onSubmitClicked: onSubmitClicked,
                    closeModal: closeModal,
                    onActionDotsClicked: onActionDotsClicked,
                    onDeleteClicked: onDeleteClicked,
                    onEditClicked: onEditClicked
                };
                vm.$onInit = function () {
                    activateController();
                }
            }],
        controllerAs: "vm",
        templateUrl: "js/expanses/expanse-list-component-template.html"
    });
})();