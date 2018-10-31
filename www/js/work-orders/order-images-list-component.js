(function() {
  "use strict";
  var componentConfig = {
    bindings: {
      barcode: "<",
      isEstimate: "<",
      showDeleteImageOnModal: "<"
    },
    templateUrl: "js/work-orders/order-images-list-component.template.html",
    controller: [
      "$scope",
      "$stateParams",
      "$q",
      "$timeout",
      "$ionicModal",
      "work-orders-factory",
      "fpm-utilities-factory",
      "estimates-factory",
      "fieldPromaxConfig",
      function(
        $scope,
        $stateParams,
        $q,
        $timeout,
        $ionicModal,
        workOrdersFactory,
        fpmUtilitiesFactory,
        estimateFactory,
        fieldPromaxConfig
      ) {
        var vm = this;
        vm.isExpanded = false;
        var baseUrl = fieldPromaxConfig.fieldPromaxApi;
        var alerts = fpmUtilitiesFactory.alerts;
        vm.showDeleteImageOnModal = false;
        var currentIndex = 0;
        var exts = [
          ".tif",
          ".tiff",
          ".gif",
          ".jpeg",
          ".jpg",
          ".jif",
          ".jfif",
          ".jp2",
          ".jpx",
          ".j2k",
          ".j2c",
          ".pcd",
          ".png",
          ".bmp"
        ];

        var selectedFiles = null;

        vm.upload = {
          control: null,
          uploadImages: function(files) {
            var model = {
              barcode: vm.barcode,
              estimateId: estimateId
            };
            if (files && files.length > 0) {
              fpmUtilitiesFactory.showLoading("Uploading");
              workOrdersFactory
                .uploadFiles(files, model)
                .then(function(response) {
                  _getImages();
                })
                .finally(function() {
                  fpmUtilitiesFactory.hideLoading();
                  alerts.alert("Uploaded", "File(s) Uploaded successfully");
                });
            }
          },
          uploadImage: function(rawImage, imageName, take, isLast) {
            var defer = $q.defer();
            model = {
              barcode: vm.barcode,
              image: rawImage,
              name: imageName,
              estimateId: estimateId
            };
            fpmUtilitiesFactory
              .showLoading(
                "Uploading " +
                  (currentIndex + 1) +
                  " of " +
                  (take ? 1 : selectedFiles.length)
              )
              .then(function() {
                workOrdersFactory
                  .uploadFile(model)
                  .then(
                    function(response) {
                      if (response && response.entity) {
                        imageName = response.entity.name;
                        vm.barcodeImages.push({
                          barcode: vm.barcode,
                          fileName: imageName,
                          estimateId: estimateId,
                          imageURL: "/" + imageName + (take ? ".jpg" : ""),
                          num: response.entity.newIdentity
                        });
                      }
                      defer.resolve();
                      if (isLast) {
                        alerts.alert(
                          "Uploaded",
                          "File(s) Uploaded successfully"
                        );
                      }
                    },
                    function(e) {
                      alerts.alert("ERROR WHILE UPLOADING", "Please try again");
                      defer.reject();
                    }
                  )
                  .finally(fpmUtilitiesFactory.hideLoading);
              });

            return defer.promise;
          },
          options: {
            multiple: true,
            showFileList: false,
            localization: {
              select: "Upload images"
            },
            select: function(e) {
              e.isDefaultPrevented = true;
              var largeFiles = _.filter(e.files, function(f) {
                return f.size > maxImageSize;
              });
              if (largeFiles.length > 0) {
                alerts.alert(
                  "Invalid Selection",
                  "Image size is too large to upload"
                );
                e.preventDefault();
                return false;
              }
              selectedFiles = e.files;
              vm.upload.uploadImages(e.files);
              e.preventDefault();
            }
          }
        };

        vm.currentImage = null;
        vm.events = {
          takePictureClicked: function() {
            fpmUtilitiesFactory.device.getPicture().then(function(imageData) {
              $timeout(function() {
                if (imageData) {
                  var name =
                    "Picture" +
                    vm.barcode +
                    kendo.toString(new Date(), "ddffMMss");
                  vm.upload.uploadImage(
                    "data:image/jpeg;base64," + imageData,
                    name,
                    true,
                    true
                  );
                }
              }, 500);
            });
          },
          onDeleteImageClicked: function(img, index) {
            alerts.confirmDelete(function() {
              fpmUtilitiesFactory.showLoading().then(function() {
                workOrdersFactory
                  .deleteImageFromBlob(img.num, vm.barcode)
                  .then(function() {
                    alerts.alert(
                      "Success",
                      "Image has been removed",
                      function() {
                        vm.barcodeImages.splice(index, 1);
                      }
                    );
                  })
                  .finally(fpmUtilitiesFactory.hideLoading);
              });
            });
          },
          onImageTap: function(p) {
            vm.currentImage = p;
            vm.imageUrl =
              baseUrl +
              "Handlers/GetImageFromBlob.ashx?imageId=" +
              p.num +
              "&dateStamp=" +
              new Date();
            vm.imageViewerModel.show();
          },
          closeImageViewModal: function() {
            vm.imageViewerModel.hide();
          }
        };
        function _getImages() {
          if (vm.barcode && !vm.isEstimate) {
            workOrdersFactory
              .getImagesList(vm.barcode)
              .then(function(response) {
                vm.barcodeImages = response;
              });
          } else {
            estimateFactory
              .getEstimateImages(estimateId)
              .then(function(response) {
                vm.barcodeImages = response;
              });
          }
        }

        var maxImageSize = 8 * 1024 * 1024;
        var isAndroid = false;
        var estimateId = 0;
        vm.$onInit = function() {
          isAndroid = fpmUtilitiesFactory.device.isAndroid();
          if (isAndroid) {
            maxImageSize = 5 * 1024 * 1024;
          }
          if (vm.isEstimate) {
            estimateId = $stateParams.id;
          }
          _getImages();
        };

        $ionicModal
          .fromTemplateUrl("imageViewerModal.html", {
            scope: $scope,
            animation: "slide-in-up"
          })
          .then(function(modal) {
            vm.imageViewerModel = modal;
          });
      }
    ],
    controllerAs: "vm"
  };
  angular.module("fpm").component("orderImagesListComponent", componentConfig);
})();
