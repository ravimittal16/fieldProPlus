(function () {
  "use strict";

  function initFactory($cordovaDialogs, $q, $ionicPopup, $ionicModal, $ionicLoading) {
    return {
      toStringDate: function (date) {
        return moment(date).format("lll");
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
  initFactory.$inject = ["$cordovaDialogs", "$q", "$ionicPopup", "$ionicModal", "$ionicLoading"];
  angular.module("fpm").factory("fpm-utilities-factory", initFactory);


  function initRemoveExtension() {
    return function (i) {
      var o = i.substr(i.lastIndexOf("/") + 1);
      var imageName = o.substr(0, o.lastIndexOf(".")) || "";
      return imageName;
    }
  }

  angular.module("fpm").filter("removeExt", [initRemoveExtension]);
})();
