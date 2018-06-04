(function() {
  var componentConfig = {
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
        var baseUrl = fieldPromaxConfig.fieldPromaxApi;
        var alerts = fpmUtilitiesFactory.alerts;
        function uploadImage(mappedImage, imageName) {
          vm.entity.imageModel = { Image: mappedImage, Name: imageName };
          vm.entity.view = vm.ctEntity;
          vm.entity.view.entityKey = $stateParams.barCode;
          if (vm.fromEquipments) {
            vm.entity.view.dataEntityType = 102;
            vm.entity.view.entityKey = vm.useEntityId;
            vm.entity.view.barcode = $stateParams.barCode;
          } else if (vm.type) {
            vm.entity.view.dataEntityType = vm.type;
          }
          vm.ctEntity.value = imageName;
          customTypesFactory
            .uploadFile(vm.entity)
            .then(function(response) {
              $timeout(function() {
                if (response && response.success) {
                  vm.ctEntity = response.entity;
                  vm.showImageUpload = false;
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
