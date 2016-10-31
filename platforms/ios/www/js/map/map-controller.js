(function () {
    "use strict";
    var defCordinates = { x: 44.31127, y: -92.67851, xcom: -92.67851, ycom: 44.3112679 };
    function initController($scope, $cordovaGeolocation, $timeout, $ionicModal, mapFactory, sharedDataFactory) {
        var vm = this;
        var options = { timeout: 10000, enableHighAccuracy: true };
        console.log($cordovaGeolocation)
        var mapOptions = {
            center: null,
            panControl: false,
            zoomControl: true,
            scaleControl: true,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        // $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
        //     var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        //     mapOptions.center = latLng;
        //     vm.map = new google.maps.Map(document.getElementById("map"), mapOptions);
        // }, function () {
        //     vm.map = new google.maps.Map(document.getElementById("map"), mapOptions);
        // });

        $ionicModal.fromTemplateUrl("mapFilters.html", {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            vm.filtersModal = modal;
        });

        vm.filtersApplied = false;
        function onFiltersClicked() {
            console.log("HELLO WORLD");
            if (vm.filtersModal) {
                vm.filtersModal.show();
            }
        }
        function clearFilters() {
            if (vm.filtersModal) {
                vm.filtersModal.hide();
            }
        }
        function applyFilters() {
            
         }
        vm.events = {
            onFiltersClicked: onFiltersClicked,
            clearFilters: clearFilters,
            applyFilters: applyFilters
        };
        vm.mapData = {
            users: []
        };
        function getMapData() {
            mapFactory.getMapData().then(function (response) {
                if (response) {
                    vm.mapData.users = response.users;
                }
            });
        }
        function getIniitialData() {
            mapOptions.center = new window.google.maps.LatLng(defCordinates.y, defCordinates.x);
            sharedDataFactory.getIniitialData().then(function (response) {
                vm.iniitialData = response;
                if (response) {
                    var cn = response.customerNumberEntity;
                    mapOptions.center = new window.google.maps.LatLng(cn.coordinateY || defCordinates.y, cn.coordinateX || defCordinates.x);
                    mapOptions.zoom = cn.zoomDepth || 8;
                    vm.map = new google.maps.Map(document.getElementById("map"), mapOptions);
                } else {
                    mapOptions.center = new window.google.maps.LatLng(defCordinates.y, defCordinates.x);
                    vm.map = new google.maps.Map(document.getElementById("map"), mapOptions);
                }
            }).finally(getMapData);
        }
        function activateController() {
            getIniitialData();
        }

        activateController();
    }

    initController.$inject = ["$scope", "$cordovaGeolocation", "$timeout", "$ionicModal", "map-factory", "shared-data-factory"];
    angular.module("fpm").controller("map-controller", initController);
})();