(function () {
    "use strict";

    function initController(
        $scope,
        $ionicSideMenuDelegate,
        $ionicNavBarDelegate,
        $state,
        $rootScope,
        $stateParams,
        fieldPromaxConfig,
        localStorageService,
        authenticationFactory,
        fpmUtilities
    ) {
        var vm = this;
        var secLevels = fieldPromaxConfig.secLevels;
        var userData = authenticationFactory.getLoggedInUserInfo();
        var configurations = localStorageService.get("configurations");
        vm.sideMenuItems = [
            {
                title: "Home",
                state: "app.dashboard",
                icon: "home"
            },
            {
                title: "Calendar",
                state: "app.calendar",
                icon: "calendar"
            },
            {
                title: "Map",
                state: "app.map",
                icon: "location"
            },
            {
                title: "Create Work Order",
                state: "app.createWorkOrder",
                icon: "plus-round",
                isConfigurationBased: true,
                configProperty: "allowCreateWorkOrders"
            },
            {
                title: "Create Customer",
                state: "app.createCustomer",
                icon: "plus-round",
                isConfigurationBased: true,
                configProperty: "allowCreateWorkOrders"
            },
            {
                title: "Estimates",
                state: "app.estimates",
                icon: "ios-list-outline",
                isConfigurationBased: true,
                configProperty: "allowCreateEstimates"
            },
            {
                title: "My Expense",
                state: "app.expense",
                icon: "cash",
                basedOn: "etOn",
                specialFeature: true
            },
            {
                title: "Time Card",
                state: "app.timecard",
                icon: "clock",
                basedOn: "timeCard",
                specialFeature: true
            },
            {
                title: "Custom Components",
                state: "app.customComponents",
                icon: "fork-repo",
                configProperty: "customComponentsAvail",
                isConfigurationBased: true
            },
            {
                title: "Inventory",
                state: "app.inventory",
                icon: "fork-repo",
                basedOn: "inventoryOn"
            },
            {
                title: "Change Password",
                state: "app.changePassword",
                icon: "person"
            },
            {
                title: "Privacy",
                state: "app.privacy",
                icon: "person"
            },
            {
                title: "Timecard Kiosk",
                state: "app.timecardKiosk",
                icon: "clock"
            },
            {
                title: "Logout",
                state: "app.logout",
                icon: "power"
            }
        ];
        $scope.$on("$ionicView.beforeEnter", function (e, data) {
            $ionicNavBarDelegate.showBackButton(false);
        });

        var statesNotToBeSaved = [
            "app.logout",
            "login",
            "app.editOrder",
            "app.editEstimate"
        ];

        $rootScope.$on(
            "$stateChangeSuccess",
            function (event, toState, toParams, fromState, fromParams) {
                setTimeout(function () {
                    var $menuButton = document.querySelector(
                        "button[menu-toggle]"
                    );
                    if ($menuButton) {
                        if (toState.name === "app.timecardKiosk") {
                            $($menuButton).hide();
                        } else {
                            $($menuButton).show();
                        }
                    }
                }, 1000);

                if (
                    toState.name !== "app.logout" &&
                    toState.name !== "login" &&
                    toState !== "app.editOrder" &&
                    toState !== "app.editEstimate"
                ) {
                    localStorageService.set("appState", {
                        stateName: toState.name,
                        params: toParams
                    });
                }
                if (
                    toState.name === "login" &&
                    fromState.name === "app.changePassword"
                ) {
                    $rootScope.$broadcast("$fpm:onLoginViewLoaded", {
                        clearPassword: true
                    });
                }
            }
        );
        /**
         * HIDDEN FOR ALL TRAFFIC CUSTOMERS
         */
        var __integrityCustomers = [
            "97713",
            "97719",
            "99009",
            "97678",
            "97636",
            "9130353757702476",
            "9130353905042506",
            "9130354538598316",
            "9130354539121516"
        ];
        vm.events = {
            checkMenuItemVisibility: function (menu) {
                var isTrafficControllerCustomer =
                    userData.isTrafficControllerCustomer || false;
                if (
                    menu &&
                    menu.state === "app.timecard" &&
                    (__integrityCustomers.indexOf(userData.customerNumber) >
                        -1 ||
                        isTrafficControllerCustomer)
                ) {
                    // ==========================================================
                    // WE ARE NOT SHOWING TIMECARD MENU FOR INTEGRITY
                    // ==========================================================
                    return false;
                }
                /**
                 * HIDE CREATE CUSTOMER FOR TRAFFIC CONTROLLER
                 */

                if (
                    isTrafficControllerCustomer &&
                    menu &&
                    menu.state === "app.createCustomer"
                ) {
                    return false;
                }
                if (angular.isDefined(menu.basedOn)) {
                    var basedOn = userData[menu.basedOn];
                    return basedOn;
                }
                /**
                 * TIMECARD KIOSK FOR ADMINS ONLY
                 */
                if (
                    menu &&
                    menu.state === "app.timecardKiosk" &&
                    !userData.isAdminstrator
                ) {
                    return false;
                }

                if (userData.isAdminstrator) return true;
                if (
                    angular.isDefined(menu.isConfigurationBased) &&
                    menu.isConfigurationBased === true &&
                    configurations &&
                    angular.isDefined(menu.configProperty)
                ) {
                    var propValue = configurations[menu.configProperty];
                    return propValue;
                }
                return true;
            },
            onMenuItemClicked: function (item) {
                $state.go(item.state);
            },
            toggleLeft: function () {}
        };
    }
    initController.$inject = [
        "$scope",
        "$ionicSideMenuDelegate",
        "$ionicNavBarDelegate",
        "$state",
        "$rootScope",
        "$stateParams",
        "fieldPromaxConfig",
        "localStorageService",
        "authenticationFactory",
        "fpm-utilities-factory"
    ];
    angular.module("fpm").controller("app-main-controller", initController);
})();
