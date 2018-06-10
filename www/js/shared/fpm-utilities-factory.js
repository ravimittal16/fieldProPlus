(function() {
  "use strict";
  var fpm = angular.module("fpm");

  fpm.provider("fpm-utilities-factory", function() {
    var isOnDevMode = false;
    this.setApplicationModel = function(isOnDev) {
      isOnDevMode = isOnDev;
    };

    function initFactory(
      $rootScope,
      $cordovaDialogs,
      $window,
      $cordovaNetwork,
      $q,
      $ionicPopup,
      $ionicModal,
      $ionicLoading,
      $cordovaDevice,
      $cordovaCamera,
      $ionicHistory,
      $cordovaGeolocation,
      fieldPromaxConfig,
      localStorageService
    ) {
      var platforms = {
        ANDROID: 1,
        IOS: 2,
        OTHER: 3
      };
      var isShowingNotworkDialog = false;
      var networkModal = null;
      var watcher = null;
      var timeout = 1000 * 60 * 5,
        watchOptions = {
          maximumAge: 3000,
          timeout: 60000,
          enableHighAccuracy: false
        },
        posOptions = {
          maximumAge: 3000,
          timeout: 60000,
          enableHighAccuracy: false
        },
        localStorageKeys = fieldPromaxConfig.localStorageKeys;

      //PERMISSION_DENIED: 1 POSITION_UNAVAILABLE: 2 TIMEOUT: 3
      var alerts = {
        alert: function(title, template, callback) {
          var alertPopUp = $ionicPopup.alert({
            title: title,
            template: template
          });
          if (angular.isFunction(callback)) {
            alertPopUp.then(function(res) {
              callback();
            });
          }
        },
        confirmWithOkayCancel: function(
          title,
          template,
          okayCallback,
          cancelCallback
        ) {
          var confirmPopup = $ionicPopup.confirm({
            title: title,
            template: template,
            cancelText: "Cancel",
            okText: "Okay"
          });
          confirmPopup.then(function(res) {
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
        confirm: function(title, template, okayCallback, cancelCallback) {
          var confirmPopup = $ionicPopup.confirm({
            title: title,
            template: template,
            cancelText: "No",
            okText: "Yes"
          });
          confirmPopup.then(function(res) {
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
        confirmDelete: function(okCallback) {
          var confirmPopup = $ionicPopup.confirm({
            title: "Confirmation",
            template: "Are you sure?",
            cancelText: "No",
            okText: "Yes"
          });
          confirmPopup.then(function(res) {
            if (res) {
              if (angular.isFunction(okCallback)) {
                okCallback();
              }
            }
          });
        }
      };

      var deviceInfo = {
        isAndroid: function isAndroid() {
          /*Will work only from the device and if you are developing Ionic App
          * If you are on non-ionic platform you should use a method which identify whether iOS or Android.
          * return navigator.userAgent.match(/Android/i);
          */
          if (isOnDevMode) return true;
          return ionic.Platform.isAndroid();
        },
        isIOS: function isIOS() {
          /*Will work only from the device and if you are developing Ionic App
          * If you are on non-ionic platform you should use a method which identify whether iOS or Android.
          * return navigator.userAgent.match(/iOS/i);
          */
          if (isOnDevMode) return false;
          return ionic.Platform.isIOS();
          // var ios = (ionic.Platform.device().platform.match(/ios/i));
          // return ios.toString().toLowerCase() === "ios";
        }
      };

      var pushConfig = { GCM_SENDER_ID: "504804224593", registrationId: null };

      return {
        push: {
          getRegistrationId: function() {
            var id = localStorageService.get("PUSH:registrationId");
            return id;
          },
          register: function() {
            if (!isOnDevMode) {
              var pushNotification = PushNotification.init({
                android: {
                  senderID: pushConfig.GCM_SENDER_ID,
                  forceShow: "false"
                },
                ios: { alert: "true", badge: "true", sound: "true" }
              });
              pushNotification.on("registration", function(data) {
                if (data) {
                  pushConfig.registrationId = data.registrationId;
                  localStorageService.set(
                    "PUSH:registrationId",
                    data.registrationId
                  );
                }
              });
            }
          }
        },
        locationService: {
          start: function(cb) {
            var settings = localStorageService.get(
              fieldPromaxConfig.localStorageKeys.settingsKeyName
            );
            if (settings && settings.LocationServices) {
              navigator.geolocation.getCurrentPosition(
                onLocationSuccess,
                onLocationError,
                posOptions
              );
              watcher = $cordovaGeolocation.watchPosition(watchOptions);
              watcher.then(null, onLocationError, onLocationSuccess);
            }
            function onLocationError(e) {
              //DO NOTHING
            }
            function onLocationSuccess(position) {
              if (position && position.coords) {
                $rootScope.currentLocation = position;
                if (angular.isFunction(cb)) {
                  cb(position.coords);
                }
              }
            }
          },
          stop: function() {
            if (watcher && angular.isFunction(watcher.clearWatch)) {
              watcher.clearWatch();
            }
            $cordovaGeolocation.clearWatch(watcher);
          }
        },
        isOnDevMode: isOnDevMode,
        showNetworkDialog: function() {
          if (!isShowingNotworkDialog) {
            networkModal = $ionicPopup.alert({
              title: "No Network",
              template: "You're not connected to internet"
            });
            isShowingNotworkDialog = true;
            networkModal.then(function() {
              isShowingNotworkDialog = false;
            });
          }
        },
        hideNetworkDialog: function() {
          if (networkModal && isShowingNotworkDialog) {
            networkModal.close();
            isShowingNotworkDialog = false;
          }
        },
        clearHistory: function() {
          $ionicHistory.clearHistory();
        },
        device: {
          isAndroid: deviceInfo.isAndroid,
          isIOS: deviceInfo.isIOS,
          isConnected: function() {
            if (!isOnDevMode) {
              return $cordovaNetwork.isOnline();
            }
            return isOnDevMode;
          },
          getPicture: function() {
            var options = {
              quality: 50,
              destinationType: Camera.DestinationType.DATA_URL,
              sourceType: Camera.PictureSourceType.CAMERA,
              allowEdit: false,
              encodingType: Camera.EncodingType.JPEG,
              saveToPhotoAlbum: false
            };
            var defer = $q.defer();
            $cordovaCamera.getPicture(options).then(
              function(imageData) {
                defer.resolve(imageData);
              },
              function() {
                defer.reject(null);
              }
            );
            return defer.promise;
          },
          platforms: platforms,
          getPlatformInfo: function() {
            var type = isOnDevMode ? "Android" : $cordovaDevice.getPlatform();
            if (type === "Android") {
              return platforms.ANDROID;
            }
            if (type === "iOS") {
              return platforms.IOS;
            }
            return platforms.OTHER;
          }
        },
        toStringDate: function(date) {
          return kendo.toString(kendo.parseDate(date), "g");
          //return moment(date).format("lll");
        },
        showLoading: function(title) {
          var template = title || "please wait...";
          return $ionicLoading.show({
            template: template
          });
        },
        getModal: function(name, scope) {
          var defer = $q.defer();
          $ionicModal
            .fromTemplateUrl(name, {
              scope: scope,
              animation: "slide-in-up",
              focusFirstInput: true
            })
            .then(function(modal) {
              defer.resolve(modal);
            });
          return defer.promise;
        },
        hideLoading: function() {
          return $ionicLoading.hide();
        },
        alerts: {
          alert: alerts.alert,
          confirm: alerts.confirm,
          confirmDelete: alerts.confirmDelete,
          confirmWithOkayCancel: alerts.confirmWithOkayCancel
        }
      };
    }

    this.$get = [
      "$rootScope",
      "$cordovaDialogs",
      "$window",
      "$cordovaNetwork",
      "$q",
      "$ionicPopup",
      "$ionicModal",
      "$ionicLoading",
      "$cordovaDevice",
      "$cordovaCamera",
      "$ionicHistory",
      "$cordovaGeolocation",
      "fieldPromaxConfig",
      "localStorageService",
      initFactory
    ];
  });

  function initRemoveExtension() {
    return function(i) {
      if (i.lastIndexOf(".") <= 0) {
        return imageName;
      }
      var o = i.substr(i.lastIndexOf("/") + 1);
      var imageName = o.substr(0, o.lastIndexOf(".")) || "";
      return imageName;
    };
  }

  fpm.filter("removeExt", [initRemoveExtension]);
})();
