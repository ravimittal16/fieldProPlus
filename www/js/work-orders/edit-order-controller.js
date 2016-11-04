(function () {
  "use strict";

  function initController($scope, $state, $timeout, $stateParams, $ionicActionSheet, $ionicLoading,
    $ionicPopup, $ionicModal, workOrderFactory, fpmUtilities, sharedDataFactory) {
    var vm = this;
    vm.barcode = $stateParams.barCode;
    var alerts = fpmUtilities.alerts;
    vm.invoiceOpen = false;

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
            $ionicLoading.hide();
            calculateTotals();
          }
        }, function (data) {
          alerts.alert("Oops", "ERROR WHILE GETTING WORK ORDER INFORMATION..", $ionicLoading.hide);
        });
      });
    }
    getBarcodeDetails();

    

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
    "shared-data-factory"
  ];
  angular.module("fpm").controller("edit-order-controller", initController);
})();
