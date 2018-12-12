(function () {
  function initFactory(apicontext) {
    var api = "api/CustomTypes/";

    var entityTypes = {
      None: 0,
      WorkOrder: 1,
      Estimate: 2,
      Expense: 3,
      JobType: 4,
      Equipment: 101,
      EquipmentsToBarcode: 102
    };

    var controlTypes = {
      TEXT_BOX: 1,
      RADIO: 2,
      CHECKBOX: 3,
      DATE: 4,
      UPLOAD: 5
    };

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
      return apicontext.get(
        api +
        "GetCustomTypesDataByBarcode?jobTypeName=" +
        jobTypeName +
        "&barcode=" +
        barcode
      );
    }

    function uploadFile(model) {
      return apicontext.post(api + "UploadFile", model);
    }

    function updateData(model, val) {
      return apicontext.post(api + "UpdateData?checkBoxValue=" + val, model);
    }

    function deleteCustomTypesData(num) {
      return apicontext.deleteReq(api + "DeleteCustomTypeData?num=" + num);
    }

    function uploadFiles(files, model) {
      return apicontext.upload(api + "TryUploadFile", files, model);
    }


    function createClone(cloneModel) {
      return apicontext.post(api + "AddCustomeTypeClone", cloneModel);
    }

    function getWorkOrderClones(barcode, jobType) {
      return apicontext.get(
        api + "GetWorkOrderClones?barcode=" + barcode + "&jobType=" + jobType
      );
    }

    function deleteClone(num) {
      return apicontext.deleteReq(api + "DeleteCustomTypeClone?num=" + num);
    }

    function getJobTypeByName(jobTypeName) {
      return apicontext.get(
        "api/JobTypes/GetJobTypeByName?jobTypeName=" + jobTypeName);
    }

    var factory = {
      getJobTypeByName: getJobTypeByName,
      deleteClone: deleteClone,
      getWorkOrderClones: getWorkOrderClones,
      createClone: createClone,
      uploadFiles: uploadFiles,
      uploadFile: uploadFile,
      controlTypes: controlTypes,
      getCustomTypesDataByBarcode: getCustomTypesDataByBarcode,
      entityTypes: entityTypes,
      typesData: typesData,
      updateData: updateData,
      deleteCustomTypesData: deleteCustomTypesData
    };
    return factory;
  }
  initFactory.$inject = ["api-base-factory"];
  angular.module("fpm").factory("custom-types-factory", initFactory);
})();
