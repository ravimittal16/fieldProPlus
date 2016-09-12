// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'


var constants = {
  fieldPromaxApi: "https://microsoft-apiapp01371f9b84264eab9d5e506c9c4f6d24.azurewebsites.net/"
};
var fpm = angular.module('fpm', ['ionic', 'ui.router'])
  .config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {

    var routes = [
      { state: "login", config: { url: "/", controller: "login-controller", controllerAs: "vm", templateUrl: "views/login.html" } },
      { state: "dashboard", config: { url: "/home", controller: "dashboard-controller", controllerAs: "vm", templateUrl: "views/dashboard.html" } }
    ];

    angular.forEach(routes, function (route) {
      $stateProvider
        .state(route.state, route.config);
    });
    $urlRouterProvider.otherwise('/');
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
