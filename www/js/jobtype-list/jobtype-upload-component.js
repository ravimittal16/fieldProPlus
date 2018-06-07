(function() {
  var componentConfig = {
    require: {
      parentController: "?^^jobtypeListComponent"
    },
    bindings: {
      ctEntity: "=",
      fromEquipments: "=",
      useEntityId: "=",
      type: "<"
    },
    controller: [
      "$scope",
      "$ionicModal",
      "$stateParams",
      "$timeout",
      "custom-types-factory",
      "fpm-utilities-factory",
      "fieldPromaxConfig",
      function(
        $scope,
        $ionicModal,
        $stateParams,
        $timeout,
        customTypesFactory,
        fpmUtilitiesFactory,
        fieldPromaxConfig
      ) {
        var vm = this;
        vm.entity = {};
        var uploadTimeout = null;
        var takePictureTimer = null;
        var baseUrl = fieldPromaxConfig.fieldPromaxApi;
        var alerts = fpmUtilitiesFactory.alerts;
        function uploadImage(mappedImage, imageName, bytes) {
          vm.entity.imageModel = { Image: mappedImage, Name: imageName };
          vm.ctEntity.value = imageName;
          vm.entity.view = vm.ctEntity;
          vm.entity.view.entityKey = $stateParams.barCode;
          if (vm.fromEquipments) {
            vm.entity.view.dataEntityType = 102;
            vm.entity.view.entityKey = vm.useEntityId;
            vm.entity.view.barcode = $stateParams.barCode;
          } else if (vm.type) {
            vm.entity.view.dataEntityType = vm.type;
          }
          customTypesFactory
            .uploadFile(vm.entity)
            .then(function(response) {
              uploadTimeout = $timeout(function() {
                if (response && response.success) {
                  vm.ctEntity = response.entity;
                  vm.showImageUpload = false;
                  vm.ctEntity.value = response.entity.value;
                }
              }, 100);
              alerts.alert("Uploaded", "File uploaded successfully");
            })
            .finally(function() {
              fpmUtilitiesFactory.hideLoading();
              loadModal();
            });
        }

        vm.events = {
          takePictureClicked: function() {
            fpmUtilitiesFactory.device.getPicture().then(function(imageData) {
              fpmUtilitiesFactory.showLoading();
              takePictureTimer = $timeout(function() {
                if (imageData) {
                  var name =
                    "Picture" +
                    vm.barcode +
                    kendo.toString(new Date(), "ddffMMss");
                  uploadImage("data:image/jpeg;base64," + imageData, name);
                }
              }, 500);
            });
          },
          uploadImageClicked: function() {
            vm.imageUploader.control.wrapper
              .find("#upload-image")
              .trigger("click");
          },
          deleteImageClicked: function() {
            alerts.confirmDelete(function() {
              customTypesFactory
                .deleteCustomTypesData(vm.ctEntity.id)
                .then(function() {
                  alerts.alert("Image delete successfully");
                })
                .finally(function() {
                  imageViewerModel.hide();
                  vm.showImageUpload = true;
                  vm.ctEntity.value = null;
                  if (vm.parentController) {
                    vm.parentController.events.makeValueAsNull(vm.ctEntity.id);
                  }
                });
            });
          },
          showImageClick: function() {
            if (imageViewerModel !== null && !vm.showImageUpload) {
              vm.imageUrl =
                baseUrl +
                "Handlers/GetImageFromBlob.ashx?imageId=" +
                vm.ctEntity.id +
                "&entity=custom" +
                "&dateStamp=" +
                new Date();
              imageViewerModel.show();
            }
          },
          closeImageViewModal: function() {
            if (imageViewerModel) {
              imageViewerModel.hide();
            }
          }
        };

        function loadModal() {
          $ionicModal
            .fromTemplateUrl("imageViewerModal.html", {
              scope: $scope,
              animation: "slide-in-up"
            })
            .then(function(modal) {
              imageViewerModel = modal;
            });
        }

        vm.imageUploader = {
          control: null,
          config: {
            select: function(e) {
              e.isDefaultPrevented = true;
              fpmUtilitiesFactory.showLoading();
              var exts = [
                "tif",
                "tiff",
                "gif",
                "jpeg",
                "jpg",
                "jif",
                "jfif",
                "jp2",
                "jpx",
                "j2k",
                "j2c",
                "pcd",
                "png",
                "bmp"
              ];
              var extension = e.files[0].name.split(".");
              var getExt = extension.reverse();
              if (e.files[0].size > 10 * 1024 * 1024) {
                fpmUtilitiesFactory.hideLoading();
                alerts.alert(
                  "Warning",
                  "This file is too big. Max size is 10 MB"
                );
                return;
              }
              if ($.inArray(getExt[0].toLowerCase(), exts) < 0) {
                fpmUtilitiesFactory.hideLoading();
                alerts.alert(
                  "Warning",
                  "Invalid image file extension ( ." +
                    getExt[0] +
                    " ). Please upload only image file."
                );
                return;
              }
              var fileReader = new FileReader();
              fileReader.onload = function(event) {
                var mapImage = event.target.result;
                uploadImage(mapImage, e.files[0].name);
              };
              fileReader.readAsDataURL(e.files[0].rawFile);
            },
            showFileList: false,
            localization: {
              select: "upload image"
            },
            multiple: false
          }
        };
        var imageViewerModel = null;
        vm.$onDestroy = function() {
          vm.showImageUpload = false;
          vm.ctEntity = null;
          if (uploadTimeout) {
            $timeout.cancel(uploadTimeout);
          }
          if (takePictureTimer) {
            $timeout.cancel(takePictureTimer);
          }
        };
        vm.$onInit = function() {
          vm.showImageUpload = vm.ctEntity.value === null;
          if (!vm.showImageUpload) {
            loadModal();
          }
        };
      }
    ],
    controllerAs: "vm",
    templateUrl: "js/jobtype-list/jobtype-upload-component-template.html"
  };
  angular.module("fpm").component("jobtypeUploadComponent", componentConfig);
})();
