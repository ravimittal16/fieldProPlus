// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// "http://microsoft-apiapp01371f9b84264eab9d5e506c9c4f6d24.azurewebsites.net/"
// "https://microsoft-apiapp01371f9b84264eab9d5e506c9c4f6d24.azurewebsites.net/"
//"http://localhost/FieldPromaxApi/"  
var isInDevMode = true;
var constants = {
  fieldPromaxApi: isInDevMode ? "http://localhost:51518/" : "https://fieldpromax.azurewebsites.net/",
  localStorageKeys: {
    authorizationDataKey: "authorizationData", initialData: "initialData",
    storageKeyName: "authorizationData", configKeyName: "configurations", settingsKeyName: "userSettings", userCredentials: "userCredentials"
  }
};
var fpm = angular.module('fpm', ['ionic', 'ui.router', "LocalStorageModule", "ngCordova", "ionic-datepicker",
  "kendo.directives", "mobiscroll-datetime", "mobiscroll-timespan", "mobiscroll-numpad", "ui.rCalendar"])
  .config(["$stateProvider", "$urlRouterProvider", "$compileProvider", "$httpProvider", "$ionicConfigProvider",
    "ionicDatePickerProvider", "$provide", "fpm-utilities-factoryProvider", function ($stateProvider, $urlRouterProvider, $compileProvider,
      $httpProvider, $ionicConfigProvider, ionicDatePickerProvider, $provide, fpmUtilitiesFactoryProvider) {
      fpmUtilitiesFactoryProvider.setApplicationModel(isInDevMode);
      var routes = [
        { state: "login", config: { url: "/", controller: "login-controller", controllerAs: "vm", templateUrl: "views/login.html" } },
        { state: "app", config: { abstract: true, controller: "app-main-controller", controllerAs: "vm", templateUrl: "views/app-main.html" } },
        { state: "app.dashboard", config: { url: "/home?refresh", controller: "dashboard-controller", controllerAs: "vm", templateUrl: "views/dashboard.html" } },
        { state: "app.calendar", config: { url: "/calendar", controller: "calendar-controller", controllerAs: "vm", templateUrl: "views/calendar.html" } },
        { state: "app.map", config: { url: "/map", controller: "map-controller", controllerAs: "vm", templateUrl: "views/map.html" } },
        { state: "app.createWorkOrder", config: { url: "/createorder", controller: "create-order-controller", controllerAs: "vm", templateUrl: "views/create-order.html" } },
        {
          state: "app.editOrder", config: {
            url: "/editOrder?barCode&technicianNum&src", controller: "edit-order-controller", controllerAs: "vm", templateUrl: "views/edit-order.html"
          }
        },
        { state: "app.createCustomer", config: { url: "/createcustomer", controller: "create-customer-controller", controllerAs: "vm", templateUrl: "views/create-customer.html" } },
        { state: "app.createEstimate", config: { url: "/createestimate", controller: "create-estimate-controller", controllerAs: "vm", templateUrl: "views/create-estimate.html" } },
        { state: "app.expense", config: { url: "/expanses", controller: "expanses-controller", controllerAs: "vm", templateUrl: "views/expanses.html" } },
        { state: "app.timecard", config: { url: "/timecard", controller: "timecard-controller", controllerAs: "vm", templateUrl: "views/timecard.html" } },
        { state: "app.settings", config: { url: "/settings", controller: "settings-controller", controllerAs: "vm", templateUrl: "views/settings.html" } },
        { state: "app.changePassword", config: { url: "/changePassword", controller: "change-password-controller", controllerAs: "vm", templateUrl: "views/change-password.html" } },
        { state: "app.logout", config: { url: "/logout", controller: "logout-controller", controllerAs: "vm", templateUrl: "views/logout.html" } }
      ];

      angular.forEach(routes, function (route) {
        $stateProvider
          .state(route.state, route.config);
      });
      $urlRouterProvider.otherwise('/');
      $compileProvider.debugInfoEnabled(false);
      $httpProvider.interceptors.push("requestIntercepter");
      //DATE PICKER
      var datePickerObj = {
        inputDate: new Date(),
        setLabel: 'Set',
        todayLabel: 'Today',
        closeLabel: 'Close',
        mondayFirst: false,
        weeksList: ["S", "M", "T", "W", "T", "F", "S"],
        monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
        templateType: 'popup',
        from: new Date(2012, 8, 1),
        to: new Date(2025, 8, 1),
        showTodayButton: true,
        dateFormat: 'dd MMMM yyyy',
        closeOnSelect: false,
      };
      ionicDatePickerProvider.configDatePicker(datePickerObj);

      //$ionicConfigProvider.tabs.position(isInDevMode ? 'top' : 'bottom');
      $ionicConfigProvider.tabs.position('bottom');

      //EXCPTION HANDLING
      $provide.decorator("$exceptionHandler", ["$delegate", "$injector", function ($delegate, $injector) {
        return function (exception, cause) {
          var data = {
            type: 'angular', url: window.location.hash, localtime: Date.now()
          };
          if (cause) { data.cause = cause; }
          if (exception) {
            if (exception.message) { data.message = exception.message; }
            if (exception.name) { data.name = exception.name; }
            if (exception.stack) { data.stack = exception.stack; }
          }
          //console.log("EXCPTION", data);
        }
      }]);

    }])
  .run(["$ionicPlatform", "$rootScope", "$state", "$timeout", "fpm-utilities-factory", "authenticationFactory", "shared-data-factory",
    function ($ionicPlatform, $rootScope, $state, $timeout, fpmUtilitiesFactory, authenticationFactory, sharedDataFactory) {
      $ionicPlatform.ready(function () {
        if (window.cordova && window.cordova.plugins.Keyboard) {
          // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
          // for form inputs)
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

          // Don't remove this line unless you know what you are doing. It stops the viewport
          // from snapping when text inputs are focused. Ionic handles this internally for
          // a much nicer keyboard experience.
          cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
          StatusBar.styleDefault();
        }
        //REGISTER FOR PUSH NOTIFICATIONS
        var isandr = fpmUtilitiesFactory.device.isAndroid();
        fpmUtilitiesFactory.push.register();
        document.addEventListener("backbutton", function (event) {
          if ($state.current.name === "app.dashboard") {
            //authenticationFactory.logout(false);
            if (navigator) navigator.app.exitApp();
          }
        }, false);




        function succesFn(location) {
          var credentials = authenticationFactory.getStoredCredentials();
          if (angular.isDefined(credentials) && location) {
            location.userId = credentials.userName;
            location.isMoving = location.is_moving;
            location.coords.altitudeAccuracy = location.coords.altitude_accuracy;
            sharedDataFactory.postLocation(location);
          }
        }

        if (!isInDevMode) {

          var bgGeo = window.BackgroundGeolocation;

          bgGeo.on("location", function (location, taskId) {
            succesFn(location);
          });


          bgGeo.on("motionchange", function (isMoving, location, taskId) {
            location.is_moving = isMoving;
            succesFn(location);
          });

          var lastActivity = "";

          bgGeo.on('activitychange', function (activityName) {
            if (lastActivity !== activityName) {
              lastActivity = activityName;
              BackgroundGeolocation.getCurrentPosition(function (location, taskId) {
                succesFn(location);
              }, errorFn, {
                  timeout: 30,      // 30 second timeout to fetch location
                  maximumAge: 5000, // Accept the last-known-location if not older than 5000 ms.
                  desiredAccuracy: 10,  // Try to fetch a location with an accuracy of `10` meters.
                });
            }
          });
        }

        function errorFn(errorCode) {
          switch (errorCode) {
            case 0:
              //fpmUtilitiesFactory.alerts.alert("ERROR 0", 'Failed to retrieve location');
              break;
            case 1:
              //fpmUtilitiesFactory.alerts.alert('ERROR 1', 'You must enable location services in Settings');
              break;
            case 2:
              //fpmUtilitiesFactory.alerts.alert('ERROR 2', 'Network Error');
              break;
            case 408:
              //fpmUtilitiesFactory.alerts.alert('ERROR 408', 'Location timeout');
              break;
          }
        }

        var locationServiceRunning = false;

        var androidLocationConfig = {
          desiredAccuracy: 0,
          stationaryRadius: 50,
          distanceFilter: 0,
          disableElasticity: true,
          locationUpdateInterval: 120000,
          activityRecognitionInterval: 60000,
          stopTimeout: 5,  // Stop-detection timeout minutes (wait x minutes to turn off tracking)
          debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
          logLevel: 5,    // Verbose logging.  0: NONE
          stopOnTerminate: true,              // <-- Don't stop tracking when user closes app.
          startOnBoot: true,
          autoSync: false
        };
        var iosConfig = {
          desiredAccuracy: 0,
          stationaryRadius: 50,
          distanceFilter: 100,
          disableElasticity: true,
          activityRecognitionInterval: 60000,
          stopTimeout: 5,  // Stop-detection timeout minutes (wait x minutes to turn off tracking)
          // Application config
          debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
          logLevel: 5,    // Verbose logging.  0: NONE
          stopOnTerminate: true,              // <-- Don't stop tracking when user closes app.
          startOnBoot: true,
          autoSync: false
        };
        var locationConfig = androidLocationConfig;
        if (!isandr) {
          locationConfig = iosConfig;
        }
        //TRY TO READ location
        function readLocation() {
          bgGeo.configure(locationConfig, function (state) {
            if (!state.enabled) {
              bgGeo.start(function () {
                locationServiceRunning = true;
              });
            }
          });
        }
        if (!isInDevMode) {
          readLocation();
        }



        document.addEventListener("pause", function () {
          if (!isInDevMode && locationServiceRunning) {
            if (bgGeo) {
              bgGeo.stop(function () {
                locationServiceRunning = false;
              });
            }
          }
        }, false);
        document.addEventListener("resume", function () {
          if (!isInDevMode && bgGeo && !locationServiceRunning) {
            bgGeo.getState(function (state) {
              if (!state.enabled) {
                bgGeo.start(function () { 
                  locationServiceRunning = true;
                });
              }
            });
          }
        }, false);
      });
      //CHECK CONNECTION
      $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
        fpmUtilitiesFactory.hideNetworkDialog();
      });
      $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
        fpmUtilitiesFactory.showNetworkDialog();
      });
    }]);

fpm.constant("fieldPromaxConfig", constants);
