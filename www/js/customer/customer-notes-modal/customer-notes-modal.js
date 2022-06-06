(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            displayName: "<",
            notesModal: "<"
        },
        controller: [
            "$scope",
            "$timeout",
            "fpm-utilities-factory",
            "customers-file-factory",
            "authenticationFactory",
            function (
                $scope,
                $timeout,
                fpmUtilitiesFactory,
                customerFileFactory,
                authenticationFactory
            ) {
                var vm = this;
                vm.notes = [];
                vm.errors = [];
                var isEditMode = false;
                var maxImageSize = 10 * 1024 * 1024;
                vm.isRunning = false;
                vm.upload = {
                    control: null,
                    uploadImages: function (files, extension) {
                        var entity = {
                            extension: extension
                        };
                        if (files && files.length > 0) {
                            var customerNum =
                                customerFileFactory.selectedCustomer.num;
                            var note = customerFileFactory.selectedNote;
                            var rawFile = files[0];
                            entity.entityId = note.num;
                            entity.isWebRequest = true;
                            fpmUtilitiesFactory.showLoading().then(function () {
                                customerFileFactory
                                    .tryUploadFile(
                                        [rawFile],
                                        entity,
                                        customerNum
                                    )
                                    .then(function (response) {
                                        if (response) {
                                            if (
                                                note.notesImagesIds === null ||
                                                note.notesImagesIds ===
                                                    undefined
                                            ) {
                                                note.notesImagesIds = [];
                                            }
                                            note.notesImagesIds.push(response);
                                        }
                                    })
                                    .finally(function () {
                                        fpmUtilitiesFactory.hideLoading();
                                    });
                            });
                        }
                    },
                    options: {
                        validation: {
                            allowedExtensions: [".jpeg", ".jpg", ".png"]
                        },
                        multiple: false,
                        showFileList: false,
                        localization: {
                            select: "Upload images"
                        },
                        select: function (e) {
                            e.isDefaultPrevented = true;
                            var largeFiles = _.filter(e.files, function (f) {
                                return f.size > maxImageSize;
                            });

                            if (largeFiles.length > 0) {
                                alerts.alert(
                                    "Invalid Selection",
                                    "Image size is too large to upload"
                                );
                                e.preventDefault();
                                return false;
                            }
                            var file = e.files[0];
                            var extension = file.extension;
                            vm.upload.uploadImages(e.files, extension);
                            e.preventDefault();
                        }
                    }
                };

                function __openNoteAddEditModal() {
                    if (customerFileFactory.addEditModal) {
                        customerFileFactory.addEditModal.show();
                    } else {
                        fpmUtilitiesFactory
                            .getModal("customerAddNoteModal.html", $scope)
                            .then(function (modal) {
                                customerFileFactory.addEditModal = modal;
                                customerFileFactory.addEditModal.show();
                            });
                    }
                }

                function __updateNotesArrayElement(note) {
                    var noteFromArr = _.filter(vm.notes, function (_n) {
                        return _n.num === note.num;
                    });
                    if (noteFromArr.length > 0) {
                        noteFromArr[0].note = note.note;
                    } else {
                        vm.notes.push(note);
                    }
                }

                vm.events = {
                    openAddNoteModal: function () {
                        isEditMode = false;
                        customerFileFactory.selectedNote = null;
                        __openNoteAddEditModal();
                    },
                    deleteNote: function (note, index) {
                        fpmUtilitiesFactory.alerts.confirm(
                            "Confirmation",
                            "Are you sure you want to delete the note?",
                            function () {
                                fpmUtilitiesFactory
                                    .showLoading("Deleting note...")
                                    .then(function () {
                                        customerFileFactory
                                            .deleteNote(note.num)
                                            .then(function (response) {
                                                if (response) {
                                                    $timeout(function () {
                                                        if (
                                                            vm.notes.length ===
                                                            1
                                                        ) {
                                                            vm.notes = [];
                                                        } else {
                                                            vm.notes.splice(
                                                                index,
                                                                1
                                                            );
                                                        }
                                                    }, 10);
                                                }
                                            })
                                            .finally(function () {
                                                fpmUtilitiesFactory.hideLoading();
                                            });
                                    });
                            }
                        );
                    },
                    editNote: function (note) {
                        isEditMode = true;
                        customerFileFactory.selectedNote = note;
                        __openNoteAddEditModal();
                    },
                    uploadImage: function (note) {
                        if (vm.upload.control) {
                            customerFileFactory.selectedNote = note;
                            vm.upload.control.wrapper
                                .find("#upload-notes-image")
                                .trigger("click");
                        }
                    },
                    showAllAttachements: function (note) {
                        customerFileFactory.selectedNote = note;
                        fpmUtilitiesFactory
                            .getModal(
                                "customerNotesAttachmentsModal.html",
                                $scope
                            )
                            .then(function (modal) {
                                customerFileFactory.attachmentsModal = modal;
                                customerFileFactory.attachmentsModal.show();
                            });
                    },
                    closeNotesModal: function () {
                        if (vm.notesModal) {
                            vm.notesModal.hide();
                        }
                    }
                };

                function _getNotes() {
                    vm.isRunning = true;
                    fpmUtilitiesFactory
                        .showLoading("Getting notes...")
                        .then(function () {
                            customerFileFactory
                                .getNotesByDisplayName(vm.displayName)
                                .then(function (response) {
                                    if (response) {
                                        vm.notes = response.notes;
                                        customerFileFactory.selectedCustomer =
                                            response.customer;
                                    }
                                })
                                .finally(function () {
                                    vm.isRunning = false;
                                    fpmUtilitiesFactory.hideLoading();
                                });
                        });
                }
                vm.$onInit = function () {
                    _getNotes();
                };

                $scope.$on(
                    "$fp:onAddEditNoteModalClosed",
                    function (event, args) {
                        /**
                         * ON NEW NTOE ADDED OR EDITED
                         */
                        if (args && args.entity) {
                            $timeout(function () {
                                __updateNotesArrayElement(args.entity);
                            }, 10);
                        }
                    }
                );
            }
        ],
        controllerAs: "vm",
        templateUrl:
            "js/customer/customer-notes-modal/customer-notes-modal.html"
    };
    angular.module("fpm").component("customerNotesModal", componentConfig);
})();
