(function () {
  "use strict";

  function initController($scope, $state, $timeout, $stateParams, $ionicActionSheet, $ionicLoading,
    $ionicPopup, $ionicModal, workOrderFactory, fpmUtilities, sharedDataFactory, authenticationFactory) {
    var vm = this;
    vm.barcode = $stateParams.barCode;
    var alerts = fpmUtilities.alerts;

    vm.invoiceOpen = false;
    vm.uiSettings = {
      isTimeCardModuleEnabled: false,
      milageTrackingEnabled: false
    };

    function getBarcodeDetails() {
      $ionicLoading.show({
        template: "loading work order..."
      }).then(function () {
        workOrderFactory.getBarcodeDetails(vm.barcode).then(function (response) {
          vm.barCodeData = response;
          if (angular.isArray(response.schedules)) {
            var _scheduleFromFilter = _.filter(response.schedules, function (sch) {
              return sch.num === parseInt($stateParams.technicianNum, 10);
            });
            vm.schedule = angular.copy(_scheduleFromFilter[0]);
            if (vm.schedule.actualStartDateTime) {
              vm.schedule.actualStartDateTime = new Date(moment(vm.schedule.actualStartDateTime));
            }

            if (vm.schedule.actualFinishDateTime) {
              vm.schedule.actualFinishDateTime = new Date(moment(vm.schedule.actualFinishDateTime));
            }

            $ionicLoading.hide();
            calculateTotals();
          }
        }, function (data) {
          alerts.alert("Oops", "ERROR WHILE GETTING WORK ORDER INFORMATION..", $ionicLoading.hide);
        });
      });
    }
    getBarcodeDetails();

    //CURRENT SCHEDULE CARD
    //============================================================================================
    function findTimeDiff(startDate, endDate) {
      if (Date.parse(startDate) && Date.parse(endDate)) {
        var diff = Math.abs(new Date(startDate) - new Date(endDate));
        console.log("S", startDate, "E", endDate);
        var seconds = Math.floor(diff / 1000); //ignore any left over units smaller than a second
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        minutes = minutes % 60;
        $timeout(function () {
          if (hours === 0) {
            vm.scheduleTimeSpan.timeSpan = minutes + " Minutes";
          } else {
            vm.scheduleTimeSpan.timeSpan = hours + " Hours " + minutes + " Minutes";
          }
        }, 50);
      } else {
        return 0;
      }
      return 0;
    }

    function addMinutes(date, minutes) {
      return new Date(date.getTime() + minutes * 60000);
    }
    vm.scheduleTimeSpan = {
      timeSpan: "",
      onTimespanSeletionChanged: function (s, e) {
        var timeSpanSelected = e.getVal();
        var seconds = Math.floor(timeSpanSelected / 1000); //ignore any left over units smaller than a second
        var minutesToAdd = Math.floor(seconds / 60);
        $timeout(function () {
          var start = angular.copy(vm.schedule.actualStartDateTime);
          var startDate;
          if (start == null) {
            startDate = new Date();
            vm.schedule.actualStartDateTime = new Date();
          } else {
            startDate = new Date(start);
          }
          var finalDate = addMinutes(startDate, minutesToAdd);
          vm.schedule.actualFinishDateTime = kendo.parseDate(finalDate);
        }, 50);
      },
      onStartDateTimeChaged: function () {
        if (vm.schedule.actualStartDateTime && vm.schedule.actualFinishDateTime) {
          if (new Date(vm.schedule.actualStartDateTime) > new Date(vm.schedule.actualFinishDateTime)) {
            alerts.alert("Warning", "Start time cannot be greater than finish time.");
          } else {
            findTimeDiff(vm.schedule.actualStartDateTime, vm.schedule.actualFinishDateTime);
          }
        }
      },
      onEndDateTimeChanged: function () {
        console.log("HELLOOOO")
        if (vm.schedule.actualStartDateTime && vm.schedule.actualFinishDateTime) {
          if (new Date(vm.schedule.actualStartDateTime) > new Date(vm.schedule.actualFinishDateTime)) {
            alerts.alert("Warning", "Start time cannot be greater than finish time.");
          } else {
            findTimeDiff(vm.schedule.actualStartDateTime, vm.schedule.actualFinishDateTime);
          }
        }
      },
      clearAllDateTimeSelection: function () {}
    };
    //================================================================================================

    function activateController() {
      console.log(activateController);
      vm.user = authenticationFactory.getLoggedInUserInfo();
      vm.uiSettings.isTimeCardModuleEnabled = vm.user.timeCard && vm.user.allowPushTime;
      sharedDataFactory.getIniitialData(true).then(function (response) {
        if (response) {

          vm.uiSettings.milageTrackingEnabled = response.customerNumberEntity.milageTrackingEnabled || false;
          vm.scheduleStatus = response.secondaryOrderStatus;
          console.log("vm.scheduleStatus", response.secondaryOrderStatus);
        }
      });
    }
    activateController();

    function calculateTotals() {
      vm.totals = {
        subtotal: 0,
        totalqty: 0,
        totalcost: 0,
        totaltax: 0
      };
      if (vm.barCodeData.invoice && vm.barCodeData.invoice.length > 0) {
        var taxRate = vm.barCodeData.taxRate || 0;
        angular.forEach(vm.barCodeData.invoice, function (pro) {
          if (pro.price && pro.qty) {
            if (angular.isNumber(parseFloat(pro.price)) && angular.isNumber(parseInt(pro.qty, 10))) {
              var totalPrice = pro.price * pro.qty;
              var taxAmt = parseFloat(parseFloat(taxRate) > 0 ? parseFloat((taxRate / 100) * (totalPrice)) : 0);
              vm.totals.subtotal += parseFloat(totalPrice);
              vm.totals.totalqty += parseInt(pro.qty, 10);
              if ((pro.taxable || false) === true) {
                vm.totals.totaltax += parseFloat(taxAmt);
              }
            }
          }
        });
      }
    }


    vm.tabs = {
      sch: {
        events: {
          onListScheduleItemTap: function (sch) {
            console.log(sch)
          },
          onScheduleActionButtonClicked: function () {
            var hideSheet = $ionicActionSheet.show({
              buttons: [{
                text: 'Add New Schedule'
              }],
              titleText: 'Schedule',
              cancelText: 'Cancel',
              cancel: function () {
                // add cancel code..
              },
              buttonClicked: function (index) {
                return true;
              }
            });
          }
        }
      },
      smry: {
        events: {

        }
      },
      prod: {
        events: {
          onProdcutActionButtonClicked: function () {
            var productSheet = $ionicActionSheet.show({
              buttons: [{
                text: 'Add New Product'
              }],
              titleText: 'New Product',
              cancelText: 'Cancel',
              cancel: function () {
                // add cancel code..
              },
              buttonClicked: function (index) {
                if (index === 0) {
                  vm.productSearchModal.show();
                }
                return true;
              }
            });
          },
          closeProductEditModal: function () {
            vm.productModal.hide();
          },
          openProductSearchModal: function () {

          },
          onEditProductClicked: function (product) {
            vm.currentProduct = angular.copy(product);
            vm.productModal.show();
          },
          onDeleteProductClicked: function (product) {
            alerts.confirmDelete(function () {
              workOrderFactory.deleteProduct(vm.barcode, product.num).then(function (response) {
                if (response) {
                  vm.barCodeData.products = response.products;
                  vm.barCodeData.invoice = response.invoice;
                  calculateTotals();
                }
              });
            });
          }
        }
      }
    }



    $ionicModal.fromTemplateUrl("productSearchModal.html", {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      vm.productSearchModal = modal;
    });


    $ionicModal.fromTemplateUrl("editProductModal.html", {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      vm.productModal = modal;
    });

    $scope.$on("$fpm:closeEditProductModal", function () {
      vm.productModal.hide();
    });

    $scope.$on("$fpm:closeProductSearchModal", function ($event, args) {
      if (vm.productSearchModal) {
        if (args && args.fromProductAdd === true) {
          workOrderFactory.getBarcodeInvoiceAndProductDetails(vm.barcode).then(function (response) {
            vm.barCodeData.products = response.products;
            vm.barCodeData.invoice = response.invoice;
            calculateTotals();
          });
        }
        vm.productSearchModal.hide();
      }
    });

    $scope.$on("$fpm:operation:updateProduct", function ($event, agrs) {
      if (agrs && vm.currentProduct) {
        var uProduct = _.filter(vm.barCodeData.products, function (p) {
          return p.num === agrs.num;
        });
        var uInvoice = _.filter(vm.barCodeData.invoice, function (n) {
          return n.productName !== "Labor" && n.numFromSchedule === agrs.num;
        })
        $timeout(function () {
          if (uProduct.length > 0) {
            uProduct[0].qty = agrs.qty;
            uProduct[0].productDescription = agrs.productDescription;
            uProduct[0].price = agrs.price;
          }
          if (uInvoice.length > 0) {
            uInvoice[0].qty = agrs.qty;
            uInvoice[0].productDescription = agrs.productDescription;
            uInvoice[0].price = agrs.price;
            uInvoice[0].totalPrice = parseFloat(agrs.qty) * parseFloat(agrs.price);
          }
          calculateTotals();
          vm.productModal.hide();
        }, 100);
      }
    });

  }
  initController.$inject = ["$scope", "$state", "$timeout", "$stateParams", "$ionicActionSheet",
    "$ionicLoading", "$ionicPopup", "$ionicModal", "work-orders-factory", "fpm-utilities-factory",
    "shared-data-factory", "authenticationFactory"
  ];
  angular.module("fpm").controller("edit-order-controller", initController);
})();
