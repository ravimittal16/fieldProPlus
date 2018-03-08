(function() {
  "use strict";

  function initFactory(apiContext) {
    var apibase = "api/InventoryContainers/";

    function getProductContainers(productId) {
      return apiContext.get(apibase + "GetProductContainers?num=" + productId);
    }

    function updateProductQuantity(container) {
      return apiContext.post(apibase + "UpdateQuantity", container);
    }

    function getContainers() {
      return apiContext.get(apibase + "GetInventoryContainers");
    }

    function getContainerProducts(name) {
      return apiContext.get(
        apibase + "GetContainerProducts?containerName=" + name
      );
    }
    function assignContainerToProduct(container) {
      return apiContext.post(apibase + "AssignContainerToProduct", container);
    }
    var factory = {};
    factory.getProductContainers = getProductContainers;
    factory.updateProductQuantity = updateProductQuantity;
    factory.getContainers = getContainers;
    factory.getContainerProducts = getContainerProducts;
    factory.assignContainerToProduct = assignContainerToProduct;
    return factory;
  }

  initFactory.$inject = ["api-base-factory"];
  angular.module("fpm").factory("inventory-data-factory", initFactory);
})();
