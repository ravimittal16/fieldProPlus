(function () {
  "use strict";


  angular.module("fpm").provider("fpm-utilities-factory", function () {
    var isOnDevMode = false;
    this.setApplicationModel = function (isOnDev) {
      isOnDevMode = isOnDev;
    }


    function initFactory($cordovaDialogs, $q, $ionicPopup, $ionicModal, $ionicLoading, $cordovaDevice, $cordovaCamera, $ionicHistory) {
      var platforms = {
        ANDROID: 1, IOS: 2, OTHER: 3
      };
      return {
        clearHistory: function () {
          $ionicHistory.clearHistory();
        },
        device: {
          getPicture: function () {
            var defer = $q.defer();
            var options = {
              quality: 75,
              destinationType: Camera.DestinationType.DATA_URL,
              sourceType: Camera.PictureSourceType.CAMERA,
              allowEdit: true,
              encodingType: Camera.EncodingType.JPEG,
              saveToPhotoAlbum: false
            };
            $cordovaCamera.getPicture(options).then(function (imageData) {
              defer.resolve(imageData);
            }, function () {
              $ionicPopup.alert({ title: "Failed", template: "Failed to get Image Data" }, function () {
                defer.resolve(null);
              });
            });
            return defer.promise;
          },
          platforms: platforms,
          getPlatformInfo: function () {
            var type = isOnDevMode ? "Android" : $cordovaDevice.getPlatform();
            if (type === "Android") {
              return platforms.ANDROID;
            }
            if (type === "iOS") {
              return platforms.IOS
            }
            return platforms.OTHER;
          }
        },
        toStringDate: function (date) {
          return kendo.toString(kendo.parseDate(date), "g");
          //return moment(date).format("lll");
        },
        showLoading: function (title) {
          var template = title || "please wait...";
          return $ionicLoading.show({
            template: template
          });
        },
        getModal: function (name, scope) {
          var defer = $q.defer();
          $ionicModal.fromTemplateUrl(name, {
            scope: scope,
            animation: 'slide-in-up',
            focusFirstInput: true
          }).then(function (modal) {
            defer.resolve(modal);
          });
          return defer.promise;
        },
        hideLoading: function () {
          return $ionicLoading.hide();
        },
        alerts: {
          alert: function (title, template, callback) {
            var alertPopUp = $ionicPopup.alert({
              title: title,
              template: template
            });
            if (angular.isFunction(callback)) {
              alertPopUp.then(function (res) {
                callback();
              });
            }
          },
          confirm: function (title, template, okayCallback, cancelCallback) {
            var confirmPopup = $ionicPopup.confirm({
              title: title,
              template: template
            });
            confirmPopup.then(function (res) {
              if (res) {
                if (angular.isFunction(okayCallback)) {
                  okayCallback();
                }
              } else {
                if (angular.isFunction(cancelCallback)) {
                  cancelCallback();
                }
              }
            });
          },
          confirmDelete: function (okCallback) {
            var confirmPopup = $ionicPopup.confirm({
              title: "Confirmation",
              template: 'Are you sure?'
            });
            confirmPopup.then(function (res) {
              if (res) {
                if (angular.isFunction(okCallback)) {
                  okCallback();
                }
              }
            });
          }
        }
      };
    }


    this.$get = ["$cordovaDialogs", "$q", "$ionicPopup", "$ionicModal", "$ionicLoading", "$cordovaDevice", "$cordovaCamera", "$ionicHistory", initFactory];
  });




  function initRemoveExtension() {
    return function (i) {
      var o = i.substr(i.lastIndexOf("/") + 1);
      var imageName = o.substr(0, o.lastIndexOf(".")) || "";
      return imageName;
    }
  }

  angular.module("fpm").filter("removeExt", [initRemoveExtension]);
})();
