(function () {
    "use strict";

    function initFactory(apicontext) {
        var factory = {};
        var apiBase = "api/equipment/";

        function createNewEquipment(uin, entity, barcode, attach) {
            return apicontext.post(apiBase + "CreateEquipment?uin=" + uin + "&barcode=" + barcode + "&attach=" + attach, entity);
        }

        function getEquipments() {
            return apicontext.get(apiBase + "GetEquipmentList");
        }

        function addMaintenanceNote(note) {
            return apicontext.post(apiBase + "AddMaintenanceNote", note);
        }
        function deleteEquipment(num) {
            return apicontext.deleteApiCall(apiBase + "DeleteEquipment?id=" + num);
        }

        function getEquipmentNotes(id) {
            return apicontext.get(apiBase + "GetEquipmentNotes?id=" + id);
        }

        function deleteNote(num) {
            return apicontext.deleteApiCall(apiBase + "DeleteNote?num=" + num);
        }

        function getEquipmentsByUin(uin) {
            return apicontext.get(apiBase + "GetEquipmentsByUin?uin=" + uin);
        }

        function attachEquipToBarcode(barcode, equipNum) {
            return apicontext.get(apiBase + "AttachEquipToBarcode?barcode=" + barcode + "&equipNum=" + equipNum);
        }

        function unattachEquipToBarcode(barcode, equipNum) {
            return apicontext.get(apiBase + "UnattachEquipToBarcode?barcode=" + barcode + "&equipNum=" + equipNum);
        }

        function getBarcodeEquipments(barcode) {
            return apicontext.get(apiBase + "GetBarcodeEquipments?barcode=" + barcode);
        }

        function getEquipmentFields(equipNum, barcode) {
            return apicontext.get(apiBase + "GetEquipmentFields?barcode=" + barcode + "&num=" + equipNum);
        }

        function saveDataCustomTypes(model) {
            return apicontext.post(apiBase + "SaveDataCustomTypes", model);
        }

        function getEquipmentHistory(id) {
            return apicontext.get(apiBase + "GetEquipmentHistory?id=" + id);

        }

        factory.getEquipments = getEquipments;
        factory.addMaintenanceNote = addMaintenanceNote;
        factory.deleteEquipment = deleteEquipment;
        factory.getEquipmentNotes = getEquipmentNotes;
        factory.deleteNote = deleteNote;
        factory.getEquipmentsByUin = getEquipmentsByUin;
        factory.attachEquipToBarcode = attachEquipToBarcode;
        factory.unattachEquipToBarcode = unattachEquipToBarcode;
        factory.getBarcodeEquipments = getBarcodeEquipments;
        factory.getEquipmentFields = getEquipmentFields;
        factory.saveDataCustomTypes = saveDataCustomTypes;
        factory.getEquipmentHistory = getEquipmentHistory;

        return factory;
    }

    initFactory.$inject = ["api-base-factory"];
    angular.module("fpm").factory("equipment-factory", initFactory)
})();