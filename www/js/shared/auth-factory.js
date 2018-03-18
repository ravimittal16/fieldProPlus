(function() {
  "use strict";

  function initFactory(
    $http,
    $q,
    $rootScope,
    $state,
    $window,
    $timeout,
    $ionicHistory,
    fpmUtilitiesFactory,
    localStorageService,
    fieldPromaxConfig,
    apiContext,
    workOrdersFactory,
    timecardFactory
  ) {
    var serviceBase = fieldPromaxConfig.fieldPromaxApi;
    var localStorageKeys = fieldPromaxConfig.localStorageKeys;
    var authentication = {
      isAuth: false,
      userName: ""
    };

    function login(loginModel) {
      function onLoginSuccess(response) {
        if (response) {
          authentication.isAuth = true;
          authentication.userName = response.userName;
          var userobj = {
            token: response.access_token,
            userName: response.userName,
            customerNumber: response.customerNumber,
            secLevel: response.secLevel,
            isAdminstrator: response.isAdminstrator === "True",
            isIntuitUser: response.isIntuitUser === "True",
            userEmail: response.userEmail,
            etOn: response.etOn === "True",
            timeCard: response.timeCard === "True",
            allowPushTime: response.allowPushTime === "True",
            showPrice: response.showPrice === "True",
            havingGroupsAssigned: response.havingGroups === "True",
            inventoryOn: response.inventoryOn === "True"
          };
          localStorageService.set(localStorageKeys.userCredentials, loginModel);
          localStorageService.set(localStorageKeys.storageKeyName, userobj);
          if (response.hasOwnProperty(localStorageKeys.configKeyName)) {
            localStorageService.set(
              localStorageKeys.configKeyName,
              JSON.parse(response.configurations)
            );
          }
          if (response.userSettings) {
            localStorageService.set(
              localStorageKeys.settingsKeyName,
              JSON.parse(response.userSettings)
            );
          }
          defered.resolve(response);
        } else {
          if (response.data) {
            defered.reject(response.data.error);
          } else {
            defered.reject("Invalid Login Details");
          }
        }
      }

      function onLoginError(data) {
        fpmUtilitiesFactory.hideLoading();
        defered.reject(data);
      }
      var data =
        "grant_type=password&username=" +
        loginModel.userName +
        "&password=" +
        loginModel.password +
        "&clientId=fieldPromaxMob";
      var defered = $q.defer();

      $http
        .post(serviceBase + "token", data, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        })
        .success(onLoginSuccess)
        .error(onLoginError);
      return defered.promise;
    }

    function isAuthenticated() {
      var defer = $q.defer();
      var authenticationData = localStorageService.get(
        localStorageKeys.storageKeyName
      );

      if (authenticationData) {
        defer.resolve(true);
      } else {
        defer.resolve(false);
      }
      return defer.promise;
    }

    function getLoggedInUserInfo() {
      return localStorageService.get(localStorageKeys.storageKeyName);
    }

    function logout(clearCredentials) {
      $rootScope.$evalAsync(function() {
        timecardFactory.clearTimecardFactoryData();
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
        workOrdersFactory.clearAllCache();
        localStorageService.remove(localStorageKeys.initialData);
        localStorageService.remove(localStorageKeys.storageKeyName);
        localStorageService.remove(localStorageKeys.configKeyName);
        localStorageService.remove(localStorageKeys.settingsKeyName);
        localStorageService.clearAll();
        if (clearCredentials) {
          localStorageService.remove(localStorageKeys.userCredentials);
        }
        localStorageService.remove("orderState");
        fpmUtilitiesFactory.clearHistory();
      });
    }

    function sendPassword(uid) {
      return apiContext.get("api/public/SendPassword?email=" + uid);
    }

    function changePassword(m) {
      return apiContext.post("api/user/changepassword", m);
    }
    function getStoredCredentials() {
      return localStorageService.get(localStorageKeys.userCredentials);
    }
    function getToken() {
      var user = localStorageService.get(localStorageKeys.storageKeyName);
      return user.token;
    }
    var factory = {
      getToken: getToken,
      getStoredCredentials: getStoredCredentials,
      login: login,
      isAuthenticated: isAuthenticated,
      getLoggedInUserInfo: getLoggedInUserInfo,
      logout: logout,
      sendPassword: sendPassword,
      authentication: authentication,
      changePassword: changePassword
    };
    return factory;
  }

  initFactory.$inject = [
    "$http",
    "$q",
    "$rootScope",
    "$state",
    "$window",
    "$timeout",
    "$ionicHistory",
    "fpm-utilities-factory",
    "localStorageService",
    "fieldPromaxConfig",
    "api-base-factory",
    "work-orders-factory",
    "timecard-factory"
  ];
  angular.module("fpm").factory("authenticationFactory", initFactory);
})();
