(function () {
  "use strict";

  function _initController(
    $scope,
    $rootScope,
    $window,
    $stateParams,
    $timeout,
    estimatesFactory,
    fpmUtilities,
    authenticationFactory
  ) {
    var vm = this;
    vm.estimateId = $stateParams.id;
    vm.enableMarkup = true;
    vm.user = authenticationFactory.getLoggedInUserInfo();
    vm.dateTimeFormat = $rootScope.dateFormat;
    $timeout(function () {
      vm.dateTimeFormat = vm.user.dateFormat;
    }, 100);
    var alerts = fpmUtilities.alerts;
    var selectedImagesForMail = [];

    vm.popModal = {
      type: "DESCRIPTION",
      modal: null,
      placeholder: "enter here...",
      content: ""
    };


    function calculateTotals() {
      vm.totals = {
        subtotal: 0,
        totalqty: 0,
        totalcost: 0,
        totaltax: 0
      };
      if (vm.est.invoice && vm.est.invoice.length > 0) {
        var taxRate = vm.est.estimate.woTaxRate || 0;
        angular.forEach(vm.est.invoice, function (pro) {
          if (pro.price && pro.qty) {
            var totalPrice = 0;
            if (
              angular.isNumber(parseFloat(pro.price)) &&
              angular.isNumber(parseInt(pro.qty, 10))
            ) {
              if (pro.markUpPercent > 0) {
                var newPrice =
                  parseFloat(pro.price) +
                  parseFloat(((pro.markUpPercent || 0) / 100) * pro.price);
                totalPrice = newPrice * pro.qty;
              } else {
                totalPrice = pro.price * pro.qty;
              }
              pro.totalPrice = totalPrice;
              vm.totals.subtotal += parseFloat(totalPrice);
              vm.totals.totalqty += parseInt(pro.qty, 10);
              if ((pro.isTaxable || false) === true) {
                var taxAmt = parseFloat(
                  parseFloat(taxRate) > 0 ?
                  parseFloat((taxRate / 100) * totalPrice) :
                  0
                );
                vm.totals.totaltax += parseFloat(taxAmt);
              }
            }
          }
        });
      }
    }

    function openEditProductModal() {
      if (vm.currentProduct) {
        if (vm.productModal) {
          vm.productModal.show();
        } else {
          fpmUtilities
            .getModal("editProductModal.html", $scope)
            .then(function (modal) {
              vm.productModal = modal;
              vm.productModal.show();
            });
        }
      }
    }
    vm.sendingEmail = false;

    function updateEstimate(showSuccessAlert) {

      estimatesFactory
        .updateWorkOrderEstimate(vm.est.estimate)
        .then(function (response) {
          if (response && showSuccessAlert) {
            alerts.alert("Success", "Estimate has been updated successfully");
          }
        });
    }
    vm.tabs = {
      events: {
        updateClicked: function () {
          if (vm.popModal.type === "DESCRIPTION") {
            vm.est.estimate.woDescription = vm.popModal.content;
          }
          if (vm.popModal.type === "NOTES") {
            vm.est.estimate.woNotes = vm.popModal.content;
          }
          vm.events.onDescriptionOrNotesChanged();
          vm.popModal.modal.hide();
        },
        closePopoutModal: function () {
          vm.popModal.modal.hide();
        }
      }
    }
    vm.events = {
      popoutTextBox: function (type) {
        switch (type) {
          case 'DESCRIPTION':
            vm.popModal.content = angular.copy(
              vm.est.estimate.woDescription
            );
            break;
          case 'NOTES':
            vm.popModal.content = angular.copy(
              vm.est.estimate.woNotes
            );
            break;
        }
        vm.popModal.type = type;
        if (vm.popModal.modal) {
          vm.popModal.modal.show();
        } else {
          fpmUtilities
            .getModal("fulltextModal.html", $scope)
            .then(function (modal) {
              vm.popModal.modal = modal;
              vm.popModal.modal.show();
            });
        }
      },
      sendEstimateMail: function (mails) {
        if (mails && mails.length > 0) {
          fpmUtilities.showLoading("Sending email...");
          vm.sendingEmail = true;
          var model = {
            estimateId: vm.estimateId,
            selectedImages: selectedImagesForMail,
            emailAddresses: mails
          }
          estimatesFactory.emailEstimateAsPdf(model).then(function (response) {
            if (response) {
              alerts.alert("Success", "Estimate mail has been sent.");
            }
          }, function () {}).finally(function () {
            vm.sendingEmail = false;
            fpmUtilities.hideLoading();
          })
        }
      },
      refreshOnPullDown: function () {
        _getEstimateDetails(function () {
          $scope.$broadcast("scroll.refreshComplete");
        });
      },
      onProdcutActionButtonClicked: function () {
        openProductSearchModal();
      },
      onAddProductCompleted: function (product) {},
      onEditProductClicked: function (prod) {
        vm.currentProduct = prod;
        openEditProductModal();
      },
      onDeleteProductClicked: function (prod) {
        alerts.confirmDelete(function () {
          fpmUtilities.showLoading();
          estimatesFactory
            .deleteProduct(prod.num, prod.estimateId)
            .then(function (response) {
              if (response && response.entity && response.entity.products) {
                vm.est.products = response.entity.products;
                vm.est.invoice = response.entity.invoice;
                calculateTotals();
                alerts.alert(
                  "Success",
                  "Product has been deleted successfully."
                );
              }
            })
            .finally(fpmUtilities.hideLoading);
        });
      },
      onTaxCheckboaxChanged: function (inv) {
        calculateTotals();
        estimatesFactory.updateProductsForBarcodeEstimate(inv);
      },
      onDescriptionOrNotesChanged: function () {
        updateEstimate(false);
      },
      onAddressTapped: function () {
        var goourl =
          "http://maps.google.com/maps?saddr=Current+Location&daddr=";
        var d = vm.est.estimate;
        if (d.wosStreet) {
          goourl += d.wosStreet.replace("::", " ");
        }
        goourl += " " + d.wosCity + ", " + d.wosState + " " + d.wosZip;
        cordova.InAppBrowser.open(goourl, "_blank", "location=yes");
      }
    };

    function openProductSearchModal() {
      if (vm.productSearchModal) {
        vm.productSearchModal.show();
      } else {
        fpmUtilities
          .getModal("productSearchModal.html", $scope)
          .then(function (modal) {
            vm.productSearchModal = modal;
            vm.productSearchModal.show();
          });
      }
      $timeout(function () {
        $scope.$broadcast("$fpm:changeAddModalOpenPriority", false);
      }, 1000);
    }

    function _getEstimateDetails(callback) {
      estimatesFactory
        .getEstimateDetails($stateParams.id)
        .then(function (response) {
          vm.est = response;
          calculateTotals();
          if (callback && angular.isFunction(callback)) {
            callback();
          }
        });
    }

    function _addProductToEstimate(product) {
      var e = vm.est.estimate;
      fpmUtilities.showLoading().then(function () {
        estimatesFactory
          .addProductToEstimate(
            product.productNumber,
            e.woBarCode,
            e.estimateId
          )
          .then(function (response) {
            if (response && response.entity && response.entity.products) {
              vm.est.products = response.entity.products;
              vm.est.invoice = response.entity.invoice;
              calculateTotals();
              vm.productSearchModal.hide();
            }
          })
          .finally(fpmUtilities.hideLoading);
      });
    }

    $scope.$on("$fpm:onProductSelected", function ($emit, product) {
      if (product) {
        _addProductToEstimate(product);
      }
    });

    $scope.$on("$fpm:operation:updateProduct", function (event, args) {
      if (args) {
        vm.est.products = args.entity.products;
        vm.est.invoice = args.entity.invoice;
        calculateTotals();
        vm.productModal.hide();
      }
    });

    $scope.$on("fpm:imageSelectionChanged", function ($eve, $args) {
      selectedImagesForMail = $args;
    });

    $scope.$on("$fpm:closeEditProductModal", function () {
      vm.productModal.hide();
    });

    $scope.$on("$fpm:closeProductSearchModal", function () {
      vm.productSearchModal.hide();
    });

    $scope.$on("$signature:completedEvent", function () {
      _getEstimateDetails();
    });

    function activateController() {
      _getEstimateDetails();
    }

    activateController();
  }
  _initController.$inject = [
    "$scope",
    "$rootScope",
    "$window",
    "$stateParams",
    "$timeout",
    "estimates-factory",
    "fpm-utilities-factory",
    "authenticationFactory"
  ];
  angular.module("fpm").controller("edit-estimate-controller", _initController);
})();
