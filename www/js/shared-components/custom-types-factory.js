(function () {

    function initFactory(apicontext) {
        var urlPrefix = "api/CustomTypes/";


        var entityTypes =
            {
                None: 0, WorkOrder: 1, Estimate: 2, Expense: 3, JobType: 4, Equipment: 101, EquipmentsToBarcode: 102
            }

        var controlTypes = {
            TEXT_BOX: 1,
            RADIO: 2,
            CHECKBOX: 3, DATE: 4, UPLOAD: 5
        }

        var typesData = {
            requestDataCompleted: false,
            barcode: "",
            jobTypeName: "",
            entityId: 0,
            isNewType: false,
            fireGetTypesEvent: false,
            fetchViewData: false,
            data: [],
            viewData: [],
            viewDataForEquipment: []
        };


        function getCustomTypesDataByBarcode(barcode, jobTypeName) {
            return apicontext.get(urlPrefix + "GetCustomTypesDataByBarcode?jobTypeName=" + jobTypeName + "&barcode=" + barcode);
        }

        function uploadFile(model) {
            return apicontext.post(urlPrefix + "UploadFile", model);
        }
        function updateData(model, val) {
            return apicontext.post(urlPrefix + "UpdateData?checkBoxValue=" + val, model);
        }

        var factory = {};
        factory.uploadFile = uploadFile;
        factory.controlTypes = controlTypes;
        factory.getCustomTypesDataByBarcode = getCustomTypesDataByBarcode;
        factory.entityTypes = entityTypes;
        factory.typesData = typesData;
        factory.updateData = updateData;
        return factory;
    }
    initFactory.$inject = ["api-base-factory"];
    angular.module("fpm").factory("custom-types-factory", initFactory);
})();