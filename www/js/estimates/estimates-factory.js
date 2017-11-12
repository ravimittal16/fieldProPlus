(function() {
  "use strict";
  function _initFactory($q, apiContext, localStorageService) {
    var apibase = "api/Estimates/";
    function createEntity() {
      var entityFromStorage = localStorageService.get("estimateEntitySchema");
      if (entityFromStorage) {
        return $q.when(entityFromStorage);
      } else {
        return apiContext.get(apibase + "CreateEntity").then(function(entity) {
          localStorageService.set("estimateEntitySchema", entity);
          return entity;
        });
      }
    }

    function createWorkOrderEstimate(model) {
      return apiContext.post(apibase + "CreateWorkOrderEstimate", model);
    }

    function getAllEstimates() {
      return apiContext.get(apibase + "GetEstimates?status=0");
    }

    function getEstimateDetails(id) {
      return apiContext.get(
        apibase + "GetEstimateDetails?estimateId=" + id + "&fromMobile=true"
      );
    }

    function deleteEstimate(estimateId) {
      return apiContext.deleteReq(
        apibase + "DeleteEstimate?estimateId=" + estimateId
      );
    }

    function addProductToEstimate(productNum, barcode, estimateId) {
      return apiContext.get(
        apibase +
          "AddProductToEstimate?productNum=" +
          productNum +
          "&barcode=" +
          barcode +
          "&estimateId=" +
          estimateId
      );
    }

    function deleteProduct(num, estimateId) {
      return apiContext.deleteReq(
        apibase +
          "DeleteProductFromOrder?productNum=" +
          num +
          "&estimateId=" +
          estimateId
      );
    }

    function updateProduct(product) {
      return apiContext.post(apibase + "UpdateProduct", product);
    }

    function getEstimateImages(estimateId) {
      return apiContext.get(
        apibase + "GetEstimateImages?estimateId=" + estimateId
      );
    }

    function updateWorkOrderEstimate(estimate) {
      return apiContext.post(apibase + "UpdateWorkOrderEstimate", estimate);
    }
    function updateProductsForBarcodeEstimate(estimateProduct) {
      return apiContext.post(
        apibase + "UpdateProductsForBarcodeEstimate",
        estimateProduct
      );
    }

    return {
      updateProductsForBarcodeEstimate: updateProductsForBarcodeEstimate,
      updateWorkOrderEstimate: updateWorkOrderEstimate,
      getEstimateImages: getEstimateImages,
      updateProduct: updateProduct,
      deleteProduct: deleteProduct,
      addProductToEstimate: addProductToEstimate,
      deleteEstimate: deleteEstimate,
      getEstimateDetails: getEstimateDetails,
      getAllEstimates: getAllEstimates,
      createWorkOrderEstimate: createWorkOrderEstimate,
      createEntity: createEntity
    };
  }
  _initFactory.$inject = ["$q", "api-base-factory", "localStorageService"];
  angular.module("fpm").factory("estimates-factory", _initFactory);
})();
