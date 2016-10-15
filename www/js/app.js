// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// "http://microsoft-apiapp01371f9b84264eab9d5e506c9c4f6d24.azurewebsites.net/"
// "https://microsoft-apiapp01371f9b84264eab9d5e506c9c4f6d24.azurewebsites.net/"
//"http://localhost/FieldPromaxApi/"  
var isInDevMode = false;
var constants = {
  fieldPromaxApi: isInDevMode ? "http://localhost:51518/" : "https://microsoft-apiapp01371f9b84264eab9d5e506c9c4f6d24.azurewebsites.net/",
  localStorageKeys: {
    authorizationDataKey: "authorizationData", initialData: "initialData",
    storageKeyName: "authorizationData", configKeyName: "configurations", settingsKeyName: "userSettings"
  }
};
var fpm = angular.module('fpm', ['ionic', 'ui.router', "LocalStorageModule", "ngCordova", "ionic-datepicker"])
  .config(["$stateProvider", "$urlRouterProvider", "$compileProvider", "$httpProvider", "ionicDatePickerProvider",
    function ($stateProvider, $urlRouterProvider, $compileProvider, $httpProvider, ionicDatePickerProvider) {

      var routes = [
        { state: "login", config: { url: "/", controller: "login-controller", controllerAs: "vm", templateUrl: "views/login.html" } },
        { state: "app", config: { abstract: true, controller: "app-main-controller", controllerAs: "vm", templateUrl: "views/app-main.html" } },
        { state: "app.dashboard", config: { url: "/home", controller: "dashboard-controller", controllerAs: "vm", templateUrl: "views/dashboard.html" } },
        { state: "app.calendar", config: { url: "/calendar", controller: "calendar-controller", controllerAs: "vm", templateUrl: "views/calendar.html" } },
        { state: "app.map", config: { url: "/map", controller: "map-controller", controllerAs: "vm", templateUrl: "views/map.html" } },
        { state: "app.createWorkOrder", config: { url: "/createorder", controller: "create-order-controller", controllerAs: "vm", templateUrl: "views/create-order.html" } },
        { state: "app.editOrder", config: { url: "/editOrder?barCode&technicianNum&src", controller: "edit-order-controller", controllerAs: "vm", templateUrl: "views/edit-order.html" } },
        { state: "app.createCustomer", config: { url: "/createcustomer", controller: "create-customer-controller", controllerAs: "vm", templateUrl: "views/create-customer.html" } },
        { state: "app.createEstimate", config: { url: "/createestimate", controller: "create-estimate-controller", controllerAs: "vm", templateUrl: "views/create-estimate.html" } },
        { state: "app.expense", config: { url: "/expanses", controller: "expanses-controller", controllerAs: "vm", templateUrl: "views/expanses.html" } },
        { state: "app.timecard", config: { url: "/timecard", controller: "timecard-controller", controllerAs: "vm", templateUrl: "views/timecard.html" } },
        { state: "app.settings", config: { url: "/settings", controller: "settings-controller", controllerAs: "vm", templateUrl: "views/settings.html" } },
        { state: "app.changePassword", config: { url: "/changePassword", controller: "change-password-controller", controllerAs: "vm", templateUrl: "views/change-password.html" } },
        { state: "app.logout", config: { controller: "logout-controller", controllerAs: "vm" } }
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
    }])
  .run(["$ionicPlatform", function ($ionicPlatform) {
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
    });
  }]);

fpm.constant("fieldPromaxConfig", constants);
