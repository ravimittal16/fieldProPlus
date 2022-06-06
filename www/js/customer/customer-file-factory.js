(function () {
    "use strict";

    function initFactory(apiBaseFactory, $rootScope) {
        var apibaseurl = "api/CustomerFile/";
        var woController = "api/WorkOrders/";
        var selectedNote = null;
        var attachmentsModal = null;
        var addEditModal = null;
        var selectedCustomer = null;

        function searchCustomers(searchPattern) {
            return apiBaseFactory.get(
                apibaseurl + "SearchCustomers?searchPattern=" + searchPattern
            );
        }
        function createCustomer(customerModel) {
            return apiBaseFactory.post(
                apibaseurl + "CreateCustomer?fromMobile=true",
                customerModel
            );
        }
        function getNotesByDisplayName(displayName) {
            return apiBaseFactory.get(
                apibaseurl +
                    "GetNotesByDisplayName?displayName=" +
                    encodeURIComponent(displayName)
            );
        }
        function deleteNote(num) {
            return apiBaseFactory.deleteReq(
                apibaseurl + "DeleteNote?num=" + num
            );
        }

        function onAddEditNoteModalClosed(response) {
            $rootScope.$broadcast("$fp:onAddEditNoteModalClosed", response);
        }

        function addUpdateNote(note) {
            return apiBaseFactory.post(apibaseurl + "AddUpdateNote", note);
        }

        function tryUploadFile(files, model, customerFileNum) {
            return apiBaseFactory.upload(
                apibaseurl +
                    "TryUploadNoteImage?customerFileNum=" +
                    customerFileNum,
                files,
                model
            );
        }

        function deleteImage(barcode, num) {
            return apiBaseFactory.deleteReq(
                woController +
                    "DeleteImage?barcode=" +
                    encodeURIComponent(barcode) +
                    "&imageId=" +
                    num
            );
        }

        return {
            deleteImage: deleteImage,
            tryUploadFile: tryUploadFile,
            onAddEditNoteModalClosed: onAddEditNoteModalClosed,
            addUpdateNote: addUpdateNote,
            selectedCustomer: selectedCustomer,
            selectedNote: selectedNote,
            addEditModal: addEditModal,
            attachmentsModal: attachmentsModal,
            deleteNote: deleteNote,
            getNotesByDisplayName: getNotesByDisplayName,
            createCustomer: createCustomer,
            searchCustomers: searchCustomers
        };
    }
    initFactory.$inject = ["api-base-factory", "$rootScope"];
    angular.module("fpm").factory("customers-file-factory", initFactory);
})();
