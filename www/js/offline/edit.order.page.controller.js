(function () {
  "use strict";

  function initController($scope, $stateParams, sqlStorageFactory) {
    var vm = this;
    vm.barcode = $stateParams.barCode;
    vm.scheduleNum = parseInt($stateParams.technicianNum, 10)
    vm.barCodeData = {}
    vm.gettingBarcodeDetails = true;
    vm.events = {
      onEditProductClicked: function (product) {
        _updateProductEditMode();
        product.isInEditMode = !product.isInEditMode;
        console.log(product)
      },
      onDeleteProductClicked: function (product) {},
      onDescriptionOrResolutionChanged: function (controlType) {
        var propName = controlType === 'workDescription' ? 'comment_1' : 'comment_2'
        if (vm.barCodeData.barcodeDetails) {
          updateOrderInfo(controlType, vm.barCodeData.barcodeDetails[propName]);
          updateOrderInfo("jsonPayload", JSON.stringify(vm.barCodeData.barcodeDetails));
        }
      },
      onStartDateTimeChaged: function () {
        updateScheduleInfo("actualStartDateTime", kendo.toString(vm.schedule.actualStartDateTime, "g"));
      },
      onEndDateTimeChanged: function () {
        updateScheduleInfo("actualFinishDateTime", kendo.toString(vm.schedule.actualFinishDateTime, "g"));
      },
      workCompleteChanged: function () {
        updateScheduleInfo("workComplete", vm.schedule.workComplete);
      }
    };

    function updateScheduleInfo(propertyName, propertyValue) {
      sqlStorageFactory.updateScheduleInformation(propertyName, propertyValue, vm.schedule.scheduleNum);
    }

    function updateOrderInfo(propertyName, propertyValue) {
      sqlStorageFactory.updateWorkOrder(propertyName, propertyValue, vm.barcode);
    }

    function _updateProductEditMode() {
      if (vm.barCodeData.products && vm.barCodeData.products.length > 0) {
        angular.forEach(vm.barCodeData.products, function (item) {
          item.isInEditMode = false;
        });
      }
    }

    function getBarcodeDetails() {
      vm.gettingBarcodeDetails = true;
      sqlStorageFactory.getOrderInfo(vm.barcode, vm.scheduleNum).then(function (_order) {
        vm.barCodeData = _order;
        vm.barCodeData.info = JSON.parse(_order.barcodeInfo.jsonPayload);
        if (_order.workOrderDetails && _order.workOrderDetails.jsonPayload) {

          /* vm.barCodeData.barcodeDetails has all information about the order in to actual db format,
           property names are same as online page */
          vm.schedule = angular.copy(_order.schedule);
          vm.schedule.workComplete = _order.schedule.workComplete === 'true';
          vm.schedule.approve = false;
          vm.barCodeData.barcodeDetails = JSON.parse(_order.workOrderDetails.jsonPayload);


        }
      }).finally(function () {
        _updateProductEditMode();
        vm.gettingBarcodeDetails = false;
      });
    }

    getBarcodeDetails();
  }

  initController.$inject = ["$scope", "$stateParams", "sqlStorageFactory"];

  angular.module("fpm").controller("edit-order-page-offline-controller", initController);
})();
