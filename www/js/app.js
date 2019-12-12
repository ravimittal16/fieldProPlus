// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// "http://microsoft-apiapp01371f9b84264eab9d5e506c9c4f6d24.azurewebsites.net/"
// "https://microsoft-apiapp01371f9b84264eab9d5e506c9c4f6d24.azurewebsites.net/"
//"http://localhost/FieldPromaxApi/"
var isInDevMode = false;
var prodReady = true;

var runningOnEmulator = false;
if (runningOnEmulator) {
  isInDevMode = false;
  prodReady = true;
}

var constants = {
  devEnv: isInDevMode,
  fieldPromaxApi: isInDevMode
    ? "http://localhost:51518/"
    : "https://fieldpromax-stagging1.azurewebsites.net/",
  localStorageKeys: {
    authorizationDataKey: "authorizationData",
    initialData: "initialData",
    storageKeyName: "authorizationData",
    configKeyName: "configurations",
    settingsKeyName: "userSettings",
    userCredentials: "userCredentials"
  },
  mapApiUrl: "https://dataservicefp.azurewebsites.net/"
};
//https://fieldpromax-stagging1.azurewebsites.net/
//https://fieldpromax-culture.azurewebsites.net/
if (!isInDevMode && !prodReady) {
  constants.fieldPromaxApi = "https://fieldpromax-stagging1.azurewebsites.net/"; //"http://192.168.100.42:81/";
}
var db = null;
var fpm = angular
  .module("fpm", [
    "ionic",
    "ui.router",
    "LocalStorageModule",
    "ngCordova",
    "ionic-datepicker",
    "kendo.directives",
    "mobiscroll-datetime",
    "mobiscroll-timespan",
    "mobiscroll-numpad",
    "ui.rCalendar",
    "fpm.realtime"
  ])
  .config([
    "$stateProvider",
    "$urlRouterProvider",
    "$compileProvider",
    "$httpProvider",
    "$ionicConfigProvider",
    "ionicDatePickerProvider",
    "$provide",
    "fpm-utilities-factoryProvider",
    function(
      $stateProvider,
      $urlRouterProvider,
      $compileProvider,
      $httpProvider,
      $ionicConfigProvider,
      ionicDatePickerProvider,
      $provide,
      fpmUtilitiesFactoryProvider
    ) {
      fpmUtilitiesFactoryProvider.setApplicationModel(isInDevMode);
      var routes = [
        {
          state: "login",
          config: {
            url: "/",
            controller: "login-controller",
            controllerAs: "vm",
            templateUrl: "views/login.html"
          }
        },
        {
          state: "app",
          config: {
            abstract: true,
            controller: "app-main-controller",
            controllerAs: "vm",
            templateUrl: "views/app-main.html"
          }
        },
        {
          state: "app.estimates",
          config: {
            url: "/estimates",
            controller: "estimates-view-controller",
            controllerAs: "vm",
            templateUrl: "views/estimates.html"
          }
        },
        {
          state: "app.createEstimate",
          config: {
            url: "/newEstimate",
            controller: "create-estimate-controller",
            controllerAs: "vm",
            templateUrl: "views/create-estimate.html"
          }
        },
        {
          state: "app.editEstimate",
          config: {
            url: "/editest/:id",
            controller: "edit-estimate-controller",
            controllerAs: "vm",
            templateUrl: "views/edit-estimate.html"
          }
        },
        {
          state: "app.dashboard",
          config: {
            url: "/home?refresh",
            controller: "dashboard-controller",
            controllerAs: "vm",
            templateUrl: "views/dashboard.html"
          }
        },
        {
          state: "app.calendar",
          config: {
            url: "/calendar",
            controller: "calendar-controller",
            controllerAs: "vm",
            templateUrl: "views/calendar.html"
          }
        },
        {
          state: "app.map",
          config: {
            url: "/map",
            controller: "map-controller",
            controllerAs: "vm",
            templateUrl: "views/map.html"
          }
        },
        {
          state: "app.createWorkOrder",
          config: {
            url: "/createorder",
            controller: "create-order-controller",
            controllerAs: "vm",
            templateUrl: "views/create-order.html"
          }
        },
        {
          state: "app.editOrder",
          config: {
            url: "/editOrder?barCode&technicianNum&src&_i",
            controller: "edit-order-controller",
            controllerAs: "vm",
            templateUrl: "views/edit-order.html"
          }
        },
        {
          state: "app.editOrderOffline",
          config: {
            url: "/editOrder_offline?barCode&technicianNum&src&_i",
            controller: "edit-order-page-offline-controller",
            controllerAs: "vm",
            templateUrl: "js/offline/edit.order.page.controller.html"
          }
        },
        {
          state: "app.createCustomer",
          config: {
            url: "/createcustomer",
            controller: "create-customer-controller",
            controllerAs: "vm",
            templateUrl: "views/create-customer.html"
          }
        },
        {
          state: "app.customComponents",
          config: {
            url: "/customcomponents",
            controller: "custom-components-controller",
            controllerAs: "vm",
            templateUrl: "views/custom-components.html"
          }
        },
        {
          state: "app.inventory",
          config: {
            url: "/inventory",
            controller: "inventory-controller",
            controllerAs: "vm",
            templateUrl: "views/inventory.html"
          }
        },
        {
          state: "app.expense",
          config: {
            url: "/expanses",
            controller: "expanses-controller",
            controllerAs: "vm",
            templateUrl: "views/expanses.html"
          }
        },
        {
          state: "app.timecard",
          config: {
            url: "/timecard",
            controller: "timecard-controller",
            controllerAs: "vm",
            templateUrl: "views/timecard.html"
          }
        },
        {
          state: "app.settings",
          config: {
            url: "/settings",
            controller: "settings-controller",
            controllerAs: "vm",
            templateUrl: "views/settings.html"
          }
        },
        {
          state: "app.changePassword",
          config: {
            url: "/changePassword",
            controller: "change-password-controller",
            controllerAs: "vm",
            templateUrl: "views/change-password.html"
          }
        },
        {
          state: "app.logout",
          config: {
            url: "/logout",
            controller: "logout-controller",
            controllerAs: "vm",
            templateUrl: "views/logout.html"
          }
        }
      ];

      angular.forEach(routes, function(route) {
        $stateProvider.state(route.state, route.config);
      });
      $urlRouterProvider.otherwise("/");
      $compileProvider.debugInfoEnabled(false);
      $httpProvider.interceptors.push("requestIntercepter");
      //DATE PICKER
      var datePickerObj = {
        inputDate: new Date(),
        setLabel: "Set",
        todayLabel: "Today",
        closeLabel: "Close",
        mondayFirst: false,
        weeksList: ["S", "M", "T", "W", "T", "F", "S"],
        monthsList: [
          "Jan",
          "Feb",
          "March",
          "April",
          "May",
          "June",
          "July",
          "Aug",
          "Sept",
          "Oct",
          "Nov",
          "Dec"
        ],
        templateType: "popup",
        from: new Date(2012, 8, 1),
        to: new Date(2025, 8, 1),
        showTodayButton: true,
        dateFormat: "dd MMMM yyyy",
        closeOnSelect: false
      };
      ionicDatePickerProvider.configDatePicker(datePickerObj);

      //$ionicConfigProvider.tabs.position(isInDevMode ? 'top' : 'bottom');
      $ionicConfigProvider.tabs.position("bottom");

      //EXCPTION HANDLING
      $provide.decorator("$exceptionHandler", [
        "$delegate",
        "$injector",
        function($delegate, $injector) {
          return function(exception, cause) {
            var data = {
              type: "angular",
              url: window.location.hash,
              localtime: Date.now()
            };
            if (cause) {
              data.cause = cause;
            }
            if (exception) {
              if (exception.message) {
                data.message = exception.message;
              }
              if (exception.name) {
                data.name = exception.name;
              }
              if (exception.stack) {
                data.stack = exception.stack;
              }
            }
            if (isInDevMode) console.log("EXCPTION", data);
          };
        }
      ]);
    }
  ])
  .run([
    "$ionicPlatform",
    "$rootScope",
    "$state",
    "$cordovaSQLite",
    "fpm-utilities-factory",
    "authenticationFactory",
    "shared-data-factory",
    "sqlStorageFactory",
    function(
      $ionicPlatform,
      $rootScope,
      $state,
      $cordovaSQLite,
      fpmUtilitiesFactory,
      authenticationFactory,
      sharedDataFactory,
      sqlStorageFactory
    ) {
      $rootScope.isInDevMode = isInDevMode;
      $rootScope.locationTrackingOn = true;
      $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
          // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
          // for form inputs)
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);

          // Don't remove this line unless you know what you are doing. It stops the viewport
          // from snapping when text inputs are focused. Ionic handles this internally for
          // a much nicer keyboard experience.
          cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
          StatusBar.styleDefault();
        }
        var isandr = fpmUtilitiesFactory.device.isAndroid();
        //=======================================================================
        //OFFLINE CONFIGURATION
        var _dbName = sqlStorageFactory.FP_DB_NAME + ".db";
        if (!isInDevMode && window.cordova && window.SQLitePlugin) {
          try {
            db = fpmUtilitiesFactory.device.isIOS()
              ? $cordovaSQLite.openDB({
                  name: _dbName,
                  iosDatabaseLocation: "Library"
                })
              : $cordovaSQLite.openDB({
                  name: _dbName,
                  location: "default"
                });
          } catch (error) {
            window.alert("ERROR WHILE CREATING DATABASE" + error);
          }
        } else {
          /**
           * ? window.openDatabase(database_name, database_version, database_displayname, database_size);
           * This method will create a new SQL Lite Database and return a Database object.
           * Use the Database Object to manipulate the data.
           */
          db = window.openDatabase(_dbName, "1.0", "DEV", 5 * 1024 * 1024);
        }

        if (db) {
          sqlStorageFactory.setDb(db, isInDevMode);
          sqlStorageFactory.createUserLoginTable();
          sqlStorageFactory.createWorkOrdersTable();
        }

        //========================================================================

        //REGISTER FOR PUSH NOTIFICATIONS

        document.addEventListener(
          "backbutton",
          function(event) {
            if ($state.current.name === "app.dashboard") {
              //authenticationFactory.logout(false);
              if (navigator) navigator.app.exitApp();
            }
          },
          false
        );
        var isRunning = false;

        function succesFn(location) {
          var credentials = authenticationFactory.getStoredCredentials();
          $rootScope.currentLocation = location;
          if (credentials && location && !isRunning) {
            isRunning = true;
            location.userId = credentials.userName;
            location.isMoving = location.is_moving;
            location.coords.altitudeAccuracy =
              location.coords.altitude_accuracy;
            sharedDataFactory.postLocation(location).finally(function() {
              isRunning = false;
            });
          }
        }

        if (!isInDevMode) {
          var bgGeo = window.BackgroundGeolocation;

          bgGeo.on(
            "location",
            function(location, taskId) {
              succesFn(location);
              bgGeo.finish(taskId);
            },
            function(error) {
              console.log("LOCATION TACKING ", error);
              $rootScope.locationTrackingOn = error !== 1 && error !== "1";
            }
          );

          bgGeo.on("motionchange", function(isMoving, location, taskId) {
            location.is_moving = isMoving;
            succesFn(location);
            bgGeo.finish(taskId);
          });

          var lastActivity = "";
        }

        function errorFn(errorCode) {
          switch (errorCode) {
            case 0:
              // fpmUtilitiesFactory.alerts.alert(
              //   "ERROR 0",
              //   "Failed to retrieve location"
              // );
              break;
            case 1:
              // fpmUtilitiesFactory.alerts.alert(
              //   "ERROR 1",
              //   "You must enable location services in Settings"
              // );
              break;
            case 2:
              //fpmUtilitiesFactory.alerts.alert("ERROR 2", "Network Error");
              break;
            case 408:
              //fpmUtilitiesFactory.alerts.alert("ERROR 408", "Location timeout");
              break;
          }
        }

        var locationServiceRunning = false;

        var androidLocationConfig = {
          desiredAccuracy: 0,
          stationaryRadius: 50,
          distanceFilter: 50,
          disableElasticity: true,
          locationUpdateInterval: 60000,
          activityRecognitionInterval: 60000,
          stopTimeout: 5, // Stop-detection timeout minutes (wait x minutes to turn off tracking)
          debug: runningOnEmulator, // <-- enable this hear sounds for background-geolocation life-cycle.
          logLevel: runningOnEmulator ? bgGeo.LOG_LEVEL_VERBOSE : 0, // Verbose logging.  0: NONE
          startOnBoot: true,
          autoSync: false,
          stopOnTerminate: false
        };
        var iosConfig = {
          desiredAccuracy: 0,
          stationaryRadius: 50,
          distanceFilter: 200,
          disableElasticity: true,
          activityRecognitionInterval: 60000,
          stopTimeout: 5, // Stop-detection timeout minutes (wait x minutes to turn off tracking)
          // Application config
          debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
          logLevel: 0, // Verbose logging.  0: NONE
          startOnBoot: true,
          autoSync: false,
          stopOnTerminate: false
        };
        var locationConfig = androidLocationConfig;
        if (!isandr) {
          locationConfig = iosConfig;
        }
        //TRY TO READ location
        function readLocation() {
          bgGeo.configure(locationConfig, function(state) {
            if (!state.enabled) {
              bgGeo.start(function() {
                locationServiceRunning = true;
              });
            }
          });
        }
        if (!isInDevMode) {
          readLocation();
          fpmUtilitiesFactory.push.register();
        }

        function onKeyboardshow() {
          //    * This code is a hack to fix the cursor issue.
          //    * When we click on the input field and keyboard appears, the cursor most of the time is not on the right position.
          //    * It simply needs to refresh UI once. There was no solution to this problem, so I tried a hack, and it worked. ;)
          //    * i.e. disable it for 10 micro secs and then re-enable it.
          //    */
          document.body.classList.add("keyboard-opened");
          if (document.activeElement.nodeName === "INPUT") {
            setTimeout(function() {
              document.activeElement.disabled = true;
              setTimeout(function() {
                document.activeElement.disabled = false;
              }, 10);
            }, 350);
          }
        }
        document.addEventListener("native.keyboardshow", onKeyboardshow, false);
      });
    }
  ]);

fpm.constant("fieldPromaxConfig", constants);
