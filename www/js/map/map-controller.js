(function () {
    "use strict";
    function initController($scope, $cordovaGeolocation) {
        var vm = this;
        var options = { timeout: 10000, enableHighAccuracy: true };
        console.log($cordovaGeolocation)
        var mapOptions = {
            center: null,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
            var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            mapOptions.center = latLng;
            console.log("HELLO WORLD SS")
            vm.map = new google.maps.Map(document.getElementById("map"), mapOptions);
        }, function () {
            console.log("HELLO WORLD")
            vm.map = new google.maps.Map(document.getElementById("map"), mapOptions);
        });

    }

    initController.$inject = ["$scope", "$cordovaGeolocation"];
    angular.module("fpm").controller("map-controller", initController);
})();