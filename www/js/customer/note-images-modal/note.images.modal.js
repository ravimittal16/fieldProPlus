(function () {
    "use strict";
    var componentConfig = {
        controller: [
            "customers-file-factory",
            "fpm-utilities-factory",
            "$timeout",
            function (customerFileFactory, fpmUtilitiesFactory, $timeout) {
                var vm = this;
                vm.note = null;
                vm.errors = [];
                vm.events = {
                    deleteImage: function (imageId) {
                        fpmUtilitiesFactory.alerts.confirm(
                            "Confirmation",
                            "Are you sure you want to delete the image?",
                            function () {
                                customerFileFactory
                                    .deleteImage("N/A", imageId)
                                    .then(function (response) {
                                        if (response) {
                                            console.log("HELLO WORLD");
                                            $timeout(function () {
                                                vm.note.notesImagesIds =
                                                    _.filter(
                                                        vm.note.notesImagesIds,
                                                        function (id) {
                                                            return (
                                                                id !== imageId
                                                            );
                                                        }
                                                    );
                                                console.log(
                                                    vm.note.notesImagesIds
                                                );
                                            }, 10);
                                        }
                                    });
                            }
                        );
                    },
                    onImageClicked: function (id) {},
                    closeNotesModal: function () {
                        if (customerFileFactory.attachmentsModal) {
                            customerFileFactory.attachmentsModal.hide();
                            customerFileFactory.attachmentsModal.remove();
                        }
                    }
                };

                vm.$onInit = function () {
                    vm.note = customerFileFactory.selectedNote;
                };
            }
        ],
        controllerAs: "vm",
        templateUrl: "js/customer/note-images-modal/note.images.modal.html"
    };
    angular
        .module("fpm")
        .component("customerNotesImagesModal", componentConfig);
})();
