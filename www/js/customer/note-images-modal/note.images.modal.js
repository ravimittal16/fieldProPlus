(function () {
    "use strict";
    var componentConfig = {
        controller: [
            "customers-file-factory",
            function (customerFileFactory) {
                var vm = this;
                vm.note = null;
                vm.errors = [];
                vm.events = {
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
