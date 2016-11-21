(function () {
    "use strict";
    var defaultColor = "#000000";
    var defCordinates = { x: 44.31127, y: -92.67851, xcom: -92.67851, ycom: 44.3112679 };
    var mapMarkers = [];
    var markers = [];
    function initController($scope, $cordovaGeolocation, $timeout, $ionicModal, mapFactory,
        sharedDataFactory, fpmUtilitiesFactory) {
        var vm = this;
        var options = { timeout: 10000, enableHighAccuracy: true };
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
            if (vm.filtersModal) {
                vm.filtersModal.show();
            }
        }
        function clearFilters() {
            if (vm.filtersModal) {
                var uncheckedUsers = _.where(vm.mapData.users, { isChecked: false });
                _.forEach(uncheckedUsers, function (u) {
                    u.isChecked = true;
                });
                vm.filtersModal.hide();
            }
        }
        function applyFilters() {
            var checkedUsers = _.where(vm.mapData.users, { isChecked: true });
            console.log("checkedUsers", checkedUsers);
        }
        function refreshMapClicked() {
            getMapData(true);
        }
        vm.events = {
            onFiltersClicked: onFiltersClicked,
            clearFilters: clearFilters,
            applyFilters: applyFilters,
            refreshMapClicked: refreshMapClicked
        };
        vm.mapData = {
            users: [],
            orders: []
        };
        function addHandler(m, o) {
            window.google.maps.event.addListener(m, "click", function () {
                if (o.barCode !== "[HOME]") {
                    if (o.numFromTechnician !== 0) {
                        //$state.go("orderEdit", { barCode: o.barCode, technicianNum: o.numFromTechnician, src: "map" });
                    }
                }
            });
        }
        var orderCounter = 1;
        function buildMap() {
            var mapdata = vm.mapData;
            if (mapMarkers && mapMarkers.length > 0) {
                $.each(mapMarkers, function (i, l) {
                    var marker = null;
                    var myLatLng = new window.google.maps.LatLng(l.y, l.x);
                    if (l.isHome === true) {
                        marker = new window.google.maps.Marker({
                            position: myLatLng,
                            map: vm.map,
                            icon: {
                                url: l.imageurl,
                                size: new window.google.maps.Size(24, 24),
                                origin: new window.google.maps.Point(0, 0),
                                anchor: new window.google.maps.Point(0, 24)
                            },
                            shape: {
                                coord: [1, 1, 1, 20, 18, 20, 18, 1],
                                type: 'poly'
                            }
                        });
                        addHandler(marker, l);
                    } else {
                        if (l.isAssigned === true) {
                            marker = new window.google.maps.Marker({
                                position: myLatLng,
                                map: vm.map,
                                labelContent: orderCounter,
                                labelAnchor: new window.google.maps.Point(0, 7),
                                labelClass: "labels",
                                labelStyle: { opacity: 0.75 },
                                icon: {
                                    path: window.google.maps.SymbolPath.CIRCLE,
                                    scale: l.scale || 6,
                                    fillColor: l.color || defaultColor,
                                    strokeColor: l.color || defaultColor
                                }
                            });
                            orderCounter += 1;
                            markers.push({ detail: l, marker: marker, technician: l.technician, havingMap: true, isassigned: l.isAssigned, start: (l.start != null ? new Date(l.start) : null), isSpecialMarker: true, numFromTechnician: l.NumFromTechnician });
                        } else {
                            marker = new window.google.maps.Marker({
                                position: myLatLng,
                                map: vm.map,
                                icon: {
                                    path: window.google.maps.SymbolPath.CIRCLE,
                                    scale: l.scale || 6,
                                    fillColor: l.color || defaultColor,
                                    strokeColor: l.color || defaultColor
                                }
                            });
                            markers.push({ detail: l, marker: marker, technician: l.technician, havingMap: true, isassigned: l.isAssigned, start: (l.start != null ? new Date(l.start) : null), isSpecialMarker: false, numFromTechnician: l.NumFromTechnician });
                        }
                        addHandler(marker, l);
                    }
                    if ((mapMarkers.length - 1) === i) {

                    }
                });
            }
        }
        function updateMapMarkersArray() {
            mapMarkers = [];
            $.each(vm.mapData.orders, function (i, e) {
                var color = defaultColor;
                if (vm.mapData.users && e.technicianNum != null) {
                    var cRecd = _.findWhere(vm.mapData.users, { userId: e.technicianNum });
                    if (cRecd) {
                        color = cRecd.userColor || defaultColor;
                    }
                }
                var isWorkAssigned = e.scheduledStartDateTime !== null && e.scheduledFinishDateTime !== null;
                if ((Math.abs(e.coordinateX + 98.908) > 0.1) && (Math.abs(e.coordinateY - 39.45) > 0.1)) {
                    mapMarkers.push({
                        x: e.coordinateX, y: e.coordinateY, barCode: e.barcode, isHome: false, color: color,
                        scale: color === defaultColor ? 4 : 6, isAssigned: isWorkAssigned,
                        technician: e.technicianNum, start: e.scheduledStartDateTime,
                        numFromTechnician: e.numFromTechnicianSchedule
                    });
                }
                if (i === vm.mapData.orders.length - 1) {
                    buildMap();
                }
            });
        }
        function getMapData(forceGet) {

            fpmUtilitiesFactory.showLoading().then(function () {
                mapFactory.getMapData(forceGet).then(function (response) {
                    if (response) {
                        vm.mapData.users = response.users;
                        vm.mapData.orders = response.orders;
                        if (angular.isDefined(vm.mapData) && vm.mapData.orders.length > 0) {
                            updateMapMarkersArray();
                        }
                    }
                }).finally(fpmUtilitiesFactory.hideLoading);
            });
        }
        function getIniitialData() {
            markers = [];
            mapOptions.center = new window.google.maps.LatLng(defCordinates.y, defCordinates.x);
            sharedDataFactory.getIniitialData().then(function (response) {
                vm.iniitialData = response;
                if (response) {
                    var cn = response.customerNumberEntity;
                    mapOptions.center = new window.google.maps.LatLng(cn.coordinateY || defCordinates.y, cn.coordinateX || defCordinates.x);
                    mapOptions.zoom = cn.zoomDepth || 8;
                    vm.map = new google.maps.Map(document.getElementById("map"), mapOptions);
                    mapMarkers.push({ x: cn.coordinateX || defCordinates.x, y: cn.coordinateY || defCordinates.y, imageurl: "../images/markers/home.png", barCode: "[HOME]", isHome: true, color: defaultColor, technician: '', isAssigned: true, start: null, numFromTechnician: 0 });
                } else {
                    mapOptions.center = new window.google.maps.LatLng(defCordinates.y, defCordinates.x);
                    vm.map = new google.maps.Map(document.getElementById("map"), mapOptions);
                }

            }).finally(function () {
                getMapData(false);
            });
        }
        function activateController() {
            getIniitialData();
        }

        $scope.$on("$ionicView.afterEnter", function (e, data) {
            activateController();
        });
        $scope.$on("$destroy", function (event) { 
            vm.map = null;
            mapMarkers = [];
            markers = [];
        });
    }

    initController.$inject = ["$scope", "$cordovaGeolocation", "$timeout", "$ionicModal",
        "map-factory", "shared-data-factory", "fpm-utilities-factory"];
    angular.module("fpm").controller("map-controller", initController);
})();