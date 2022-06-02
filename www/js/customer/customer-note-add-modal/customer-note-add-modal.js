(function () {
    "use strict";
    var componentConfig = {
        bindings: {},
        controller: [
            "$scope",
            "$timeout",
            "fpm-utilities-factory",
            "customers-file-factory",
            function (
                $scope,
                $timeout,
                fpmUtilitiesFactory,
                customerFileFactory
            ) {
                var vm = this;
                vm.notes = [];
                vm.errors = [];
                vm.noteModel = { num: 0, note: "", numFromCustomerFile: 0 };
                function __closeModal() {
                    if (customerFileFactory.addEditModal) {
                        customerFileFactory.addEditModal.hide();
                        customerFileFactory.addEditModal.remove();
                        customerFileFactory.addEditModal = null;
                        customerFileFactory.selectedNote = null;
                    }
                }
                vm.events = {
                    closeNotesModal: function () {
                        __closeModal();
                    },
                    saveNote: function (isValid) {
                        if (isValid) {
                            fpmUtilitiesFactory
                                .showLoading("Saving...")
                                .then(function () {
                                    customerFileFactory
                                        .addUpdateNote(vm.noteModel)
                                        .then(function (response) {
                                            customerFileFactory.onAddEditNoteModalClosed(
                                                response
                                            );
                                            __closeModal();
                                        })
                                        .then(function () {
                                            fpmUtilitiesFactory.hideLoading();
                                        });
                                });
                        }
                    }
                };

                vm.$onInit = function () {
                    vm.modalTitle =
                        customerFileFactory.selectedNote === null
                            ? "Add Note"
                            : "Edit Note";
                    if (customerFileFactory.selectedNote) {
                        vm.noteModel = angular.copy(
                            customerFileFactory.selectedNote
                        );
                    } else {
                        vm.noteModel.numFromCustomerFile =
                            customerFileFactory.selectedCustomer.num;
                    }
                };
            }
        ],
        controllerAs: "vm",
        templateUrl:
            "js/customer/customer-note-add-modal/customer-note-add-modal.html"
    };
    angular.module("fpm").component("customerNoteAddModal", componentConfig);
})();
