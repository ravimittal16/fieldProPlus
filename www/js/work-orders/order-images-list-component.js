(function () {
  "use strict";
  var componentConfig = {
    bindings: {
      barcode: "<"
    },
    templateUrl: "js/work-orders/order-images-list-component.template.html",
    controller: ["$scope", "$q", "$timeout", "$ionicModal", "$ionicLoading", "work-orders-factory", "fpm-utilities-factory", "fieldPromaxConfig",
      function ($scope, $q, $timeout, $ionicModal, $ionicLoading, workOrdersFactory, fpmUtilitiesFactory, fieldPromaxConfig) {
        var vm = this;
        vm.isExpanded = false;
        var baseUrl = fieldPromaxConfig.fieldPromaxApi;
        var alerts = fpmUtilitiesFactory.alerts;

        var currentIndex = 0;
        var exts = [".tif", ".tiff", ".gif", ".jpeg", ".jpg", ".jif", ".jfif", ".jp2", ".jpx", ".j2k", ".j2c", ".pcd", ".png", ".bmp"];
        function _processUploadFile(index) {
          if (selectedFiles) {
            if ((index + 1) <= selectedFiles.length) {
              currentIndex = index;
              var file = selectedFiles[index];

              var isValidExtension = _.filter(exts, function (s) {
                return s === file.extension.toLowerCase();
              });
              if (isValidExtension.length === 0) {
                alerts.alert("Invalid File", "This is not a valid image file", function () {
                  var nextindex = index + 1;
                  _processUploadFile(nextindex);
                });
                return false;
              }
              if (isAndroid) {
                //alerts.alert("ANDROID", "THIS IS AN ANDROID DEVICE");
                var fileReader = new FileReader();
                fileReader.onload = function (e) {
                  var img = new Image();
                  img.onload = function () {
                    var newImage = resizeInCanvas(img);
                    vm.upload.uploadImage(newImage, file.name, false, (index === (selectedFiles.length - 1))).then(function () {
                      if (index === (selectedFiles.length - 1)) {
                        selectedFiles = null;
                      } else {
                        var nextindex = index + 1;
                        _processUploadFile(nextindex)
                      }
                    });
                  }
                  img.src = e.target.result;
                }
                fileReader.readAsDataURL(file.rawFile);
              } else {
                var fileReader = new FileReader();
                fileReader.onload = function (event) {
                  vm.upload.uploadImage(event.target.result, file.name, false, (index === (selectedFiles.length - 1))).then(function () {
                    if (index === (selectedFiles.length - 1)) {
                      selectedFiles = null;
                    } else {
                      var nextindex = index + 1;
                      _processUploadFile(nextindex)
                    }
                  });
                }
                fileReader.readAsDataURL(file.rawFile);
              }
            }
          }
        }

        function resizeInCanvas(img) {
          /////////  3-3 manipulate image
          var perferedWidth = 500;
          var ratio = perferedWidth / img.width;
          var canvas = $("<canvas>")[0];
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          //////////4. export as dataUrl
          return canvas.toDataURL();
        }

        var selectedFiles = null;

        vm.upload = {
          control: null,
          uploadImage: function (rawImage, imageName, take, isLast) {
            var defer = $q.defer();
            fpmUtilitiesFactory.showLoading("Uploading " + (currentIndex + 1) + " of " + (take ? (1) : (selectedFiles.length))).then(function () {
              workOrdersFactory.uploadFile({
                Barcode: vm.barcode,
                Image: rawImage,
                Name: imageName
              }).then(function (response) {
                vm.barcodeImages.push({
                  barcode: vm.barcode,
                  fileName: imageName,
                  imageURL: "/" + imageName + (take ? ".jpg" : ""),
                  num: response
                });
                defer.resolve();
                if (isLast) {
                  alerts.alert("Uploaded", "File(s) Uploaded successfully");
                }
              }, function (e) {
                alerts.alert("ERROR WHILE UPLOADING", "Please try again");
                defer.reject();
              }).finally(fpmUtilitiesFactory.hideLoading);
            });
            return defer.promise;
          },
          options: {
            multiple: true,
            showFileList: false,
            localization: {
              select: "Upload images"
            },
            select: function (e) {
              e.isDefaultPrevented = true;
              var largeFiles = _.filter(e.files, function (f) {
                return f.size > (maxImageSize * 1024 * 1024)
              });
              if (largeFiles.length > 0) {
                alerts.alert("Invalid Selection", "Image size is too large to upload");
                e.preventDefault();
                return false;
              }




              selectedFiles = e.files;
              _processUploadFile(0);
              e.preventDefault();
            }
          }
        };

        vm.currentImage = null;
        vm.events = {
          takePictureClicked: function () {
            fpmUtilitiesFactory.device.getPicture().then(function (imageData) {
              $timeout(function () {
                if (imageData) {
                  var name = "Picture" + vm.barcode + kendo.toString(new Date(), "ddffMMss");
                  vm.upload.uploadImage("data:image/jpeg;base64," + imageData, name, true, true);
                }
              }, 500);
            });
          },
          onDeleteImageClicked: function (img, index) {
            alerts.confirmDelete(function () {
              fpmUtilitiesFactory.showLoading().then(function () {
                workOrdersFactory.deleteImageFromBlob(img.num, vm.barcode).then(function () {
                  alerts.alert("Success", "Image has been removed", function () {
                    vm.barcodeImages.splice(index, 1);
                  });
                }).finally(fpmUtilitiesFactory.hideLoading);
              });
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
        var maxImageSize = 8;
        var isAndroid = false;
        vm.$onInit = function () {
          isAndroid = fpmUtilitiesFactory.device.isAndroid();
          if (isAndroid) {
            maxImageSize = 3.5;
          }
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
