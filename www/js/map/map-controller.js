(function () {
    "use strict";
    var defaultColor = "#000000";
    var defCordinates = { x: 44.31127, y: -92.67851, xcom: -92.67851, ycom: 44.3112679 };
    var mapMarkers = [];
    var markers = [];
    function initController($scope, $state, $cordovaGeolocation, $ionicActionSheet, $timeout, $ionicModal, mapFactory,
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
                vm.filterDate = null;
                var uncheckedUsers = _.where(vm.mapData.users, { isChecked: false });
                _.forEach(uncheckedUsers, function (u) {
                    u.isChecked = true;
                });
                updateMapMarkersView();
                vm.filtersModal.hide();
            }
        }
        vm.filterDate = null;
        var dateFilterApplied = false;
        function applyFilters() {
            updateMapMarkersView();
            vm.filtersModal.hide();
        }

        function setMapToMarker(markerObj, map) {
            markerObj.havingMap = map !== null;
            markerObj.marker.setMap(map);
        }

        function applyDateFilter() {
            if (markers) {
                dateFilterApplied = true;
                var isHavingOrders = false;
                var markersWithDate = _.filter(markers, function (mar) {
                    return mar.start != null && mar.havingMap === true;
                });
                angular.forEach(markersWithDate, function (m) {
                    setMapToMarker(m, null);
                });
                if (vm.filterDate) {
                    var sDate = kendo.parseDate(vm.filterDate);
                    var filterMarkers = _.filter(markersWithDate, function (item) {
                        return item.start.getDate() === parseInt(sDate.getDate())
                            && item.start.getMonth() === parseInt(sDate.getMonth())
                            && item.start.getFullYear() === parseInt(sDate.getFullYear())
                    });
                    if (filterMarkers.length > 0) {
                        _.forEach(filterMarkers, function (fmar) {
                            setMapToMarker(fmar, vm.map);
                        });
                    }
                }
            }
        }

        function updateMarkersMap(users, map, hideUnassignedMarkers) {
            hideUnassignedMarkers = hideUnassignedMarkers || false;
            angular.forEach(users, function (u) {
                var userMarkers = _.where(markers, { technician: u.userId });
                angular.forEach(userMarkers, function (m) {
                    setMapToMarker(m, map);
                });
            });
            if (hideUnassignedMarkers === true) {
                var unassigned = _.where(markers, { isassigned: false });
                _.forEach(unassigned, function (un) {
                    setMapToMarker(un, null);
                });
            }
        }
        var dateFilterTimer = null;
        function updateMapMarkersView() {
            updateMarkersMap(_.where(vm.mapData.users, { isChecked: true }), vm.map);
            updateMarkersMap(_.where(vm.mapData.users, { isChecked: false }), null);
            if (vm.filterDate) {
                dateFilterTimer = $timeout(applyDateFilter, 1000);
            }
        }

        function refreshMapClicked() {
            getMapData(true);
        }
        function invertUserSelection() {
            angular.forEach(vm.mapData.users, function (u) {
                u.isChecked = !u.isChecked;
            });
        }

        function toggleUserSelection() {
            angular.forEach(vm.mapData.users, function (u) {
                u.isChecked = true;
            });
        }
        function onServiceProviderDotsClicked() {
            $ionicActionSheet.show({
                buttons: [{
                    text: "Select All"
                },
                {
                    text: "Invert Selection"
                }],
                titleText: 'Service Provider Filter Options',
                cancelText: 'Cancel',
                cancel: function () {
                    // add cancel code..
                },
                buttonClicked: function (index) {
                    if (index === 0) {
                        toggleUserSelection();
                    }
                    if (index === 1) {
                        invertUserSelection();
                    }

                    return true;
                }
            });
        }
        function onDateFilterDotsClicked() {
            $ionicActionSheet.show({
                buttons: [
                    {
                        text: "Set As Today's Date"
                    }],
                titleText: 'Date Filter Options',
                destructiveText: 'Clear Date Filter',
                cancelText: 'Cancel',
                destructiveButtonClicked: function () {
                    vm.filterDate = null;
                    updateMapMarkersView();
                    return true;
                },
                cancel: function () {
                    // add cancel code..
                },
                buttonClicked: function (index) {
                    if (index === 0) {
                        vm.filterDate = new Date();
                    }
                    return true;
                }
            });
        }
        vm.events = {
            onFiltersClicked: onFiltersClicked,
            clearFilters: clearFilters,
            applyFilters: applyFilters,
            refreshMapClicked: refreshMapClicked,
            onServiceProviderDotsClicked: onServiceProviderDotsClicked,
            onDateFilterDotsClicked: onDateFilterDotsClicked
        };
        vm.mapData = {
            users: [],
            orders: []
        };
        function addHandler(m, o) {
            window.google.maps.event.addListener(m, "click", function () {
                if (!o.isHome && o.numFromTechnician) {
                    fpmUtilitiesFactory.alerts.confirm("Confirmation", "Are you sure to edit this work order?", function () {
                        $state.go("app.editOrder", { barCode: o.barCode, technicianNum: o.numFromTechnician, src: "map" });
                    });
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
                            markers.push({ detail: l, marker: marker, technician: l.technician, havingMap: true, isassigned: l.isAssigned, start: (l.start != null ? new Date(l.start) : null), isSpecialMarker: true, numFromTechnician: l.numFromTechnician });
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
                            markers.push({ detail: l, marker: marker, technician: l.technician, havingMap: true, isassigned: l.isAssigned, start: (l.start != null ? new Date(l.start) : null), isSpecialMarker: false, numFromTechnician: l.numFromTechnician });
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
            if (dateFilterTimer) {
                $timeout.cancel(dateFilterTimer);
            }
        });
    }

    initController.$inject = ["$scope", "$state", "$cordovaGeolocation", "$ionicActionSheet", "$timeout",
        "$ionicModal", "map-factory", "shared-data-factory", "fpm-utilities-factory"];
    angular.module("fpm").controller("map-controller", initController);
})();