(function () {
  "use strict";
  var componentConfig = {
    bindings: {
      barcode: "<"
    },
    templateUrl: "js/work-orders/order-images-list-component.template.html",
    controller: ["$scope", "$ionicModal", "$ionicLoading", "work-orders-factory", "fpm-utilities-factory", "fieldPromaxConfig",
      function ($scope, $ionicModal, $ionicLoading, workOrdersFactory, fpmUtilitiesFactory, fieldPromaxConfig) {
        var vm = this;
        vm.isExpanded = false;
        var baseUrl = fieldPromaxConfig.fieldPromaxApi;
        var alerts = fpmUtilitiesFactory.alerts;

        vm.upload = {
          control: null,
          uploadImage: function (rawImage, imageName) {
            fpmUtilitiesFactory.showLoading().then(function () {
              workOrdersFactory.uploadFile({
                Barcode: vm.barcode,
                Image: rawImage,
                Name: imageName
              }).then(function (response) {
                vm.barcodeImages.push({
                  barcode: vm.barcode,
                  fileName: imageName,
                  imageURL: "/" + imageName,
                  num: response
                });

                alerts.alert("Uploaded", "File Uploaded successfully");
              }).finally(fpmUtilitiesFactory.hideLoading);
            });
          },
          options: {
            multiple: true,
            showFileList: false,
            localization: {
              select: "Upload files"
            },
            select: function (e) {
              e.isDefaultPrevented = true;
              var exts = ["tif", "tiff", "gif", "jpeg", "jpg", "jif", "jfif", "jp2", "jpx", "j2k", "j2c", "pcd", "png", "bmp"];
              angular.forEach(e.files, function (file) {
                var extension = file.name.split(".");
                var getExt = extension.reverse();
                if (file.size < (20 * 1024 * 1024)) {
                  var filterResult = _.filter(exts, function (e) {
                    return getExt[0].toLowerCase() === e;
                  });
                  if (filterResult.length > 0) {
                    var fileReader = new FileReader();
                    fileReader.onload = function (event) {
                      vm.upload.uploadImage(event.target.result, file.name);
                    }
                    fileReader.readAsDataURL(file.rawFile);
                  }
                }
              });
            }
          }
        };

        vm.currentImage = null;
        vm.events = {
          takePictureClicked: function () {
            fpmUtilitiesFactory.device.getPicture().then(function (imageData) {
              if (imageData !== null) {
                uploadImage(imageData, "Picture" + vm.barcode + Math.random().toString());
              }
            });
          },
          onDeleteImageClicked: function (img) {
            alerts.confirmDelete(function () {
              //console.log("HELLO WORLDF");
            });
          },
          onImageTap: function (p) {
            vm.currentImage = p;
            vm.imageUrl = baseUrl + "Handlers/GetImageFromBlob.ashx?imageId=" + p.num + "&dateStamp=" + new Date();
            vm.imageViewerModel.show();
          },
          closeImageViewModal: function () {
            vm.imageViewerModel.hide();
          }
        };
        vm.$onInit = function () {
          if (vm.barcode) {
            workOrdersFactory.getImagesList(vm.barcode).then(function (response) {
              vm.barcodeImages = response;
            });
          }
        }

        $ionicModal.fromTemplateUrl("imageViewerModal.html", {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function (modal) {
          vm.imageViewerModel = modal;
        });
      }
    ],
    controllerAs: "vm"
  };
  angular.module("fpm").component("orderImagesListComponent", componentConfig);
})();
