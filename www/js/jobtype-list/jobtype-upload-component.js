(function() {
  var componentConfig = {
    bindings: {
      ctEntity: "=",
      fromEquipments: "=",
      useEntityId: "="
    },
    controller: [
      "$scope",
      "$stateParams",
      "$timeout",
      "custom-types-factory",
      "fpm-utilities-factory",
      function(
        $scope,
        $stateParams,
        $timeout,
        customTypesFactory,
        fpmUtilitiesFactory
      ) {
        var vm = this;
        vm.entity = {};
        vm.showImageUpload = vm.ctEntity.value === null;
        var alerts = fpmUtilitiesFactory.alerts;
        function uploadImage(mappedImage, imageName) {
          vm.entity.imageModel = { Image: mappedImage, Name: imageName };
          vm.entity.view = vm.ctEntity;
          vm.entity.view.entityKey = $stateParams.barCode;
          if (vm.fromEquipments) {
            vm.entity.view.dataEntityType = 102;
            vm.entity.view.entityKey = vm.useEntityId;
            vm.entity.view.barcode = $stateParams.barCode;
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
            .finally(fpmUtilitiesFactory.hideLoading);
        }

        vm.events = {
          showImageClick: function() {}
        };

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
        vm.$onInit = function() {};
      }
    ],
    controllerAs: "vm",
    templateUrl: "js/jobtype-list/jobtype-upload-component-template.html"
  };
  angular.module("fpm").component("jobtypeUploadComponent", componentConfig);
})();
