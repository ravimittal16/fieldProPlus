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
      "shared-data-factory",
      function(
        $scope,
        $ionicModal,
        $stateParams,
        $timeout,
        customTypesFactory,
        fpmUtilitiesFactory,
        fieldPromaxConfig,
        sharedDataFactory
      ) {
        var vm = this;
        vm.entity = {};
        vm.show;
        vm.showDeleteImageOnModal = true;
        var uploadTimeout = null;
        var takePictureTimer = null;
        var baseUrl = fieldPromaxConfig.fieldPromaxApi;
        var alerts = fpmUtilitiesFactory.alerts;

        function uploadImages(files) {
          var imageName = files[0].name;
          vm.entity.imageModel = { name: imageName };
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
          fpmUtilitiesFactory.showLoading();
          customTypesFactory
            .uploadFiles(files, vm.entity)
            .then(
              function(response) {
                uploadTimeout = $timeout(function() {
                  if (response && response.success) {
                    vm.ctEntity = response.entity;
                    vm.showImageUpload = false;
                    vm.ctEntity.value = response.entity.value;
                    alerts.alert("Uploaded", "File uploaded successfully");
                  }
                }, 100);
              },
              function() {
                alerts.alert("Error", "Not a valid image file.");
              }
            )
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
                    $stateParams.barCode +
                    kendo.toString(new Date(), "ddffMMss") +
                    ".jpeg";
                  sharedDataFactory
                    .convertToBlob("data:image/jpeg;base64," + imageData, name)
                    .then(
                      function(response) {
                        if (response) {
                          uploadImages([{ rawFile: response }]);
                        }
                      },
                      function() {}
                    );
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
        var exts = ["tif", "tiff", "gif", "jpeg", "jpg", "png"];
        vm.imageUploader = {
          control: null,
          config: {
            select: function(e) {
              e.isDefaultPrevented = true;
              fpmUtilitiesFactory.showLoading();

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
              uploadImages(e.files);
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
