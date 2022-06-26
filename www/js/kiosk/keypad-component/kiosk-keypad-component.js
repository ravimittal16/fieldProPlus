(function () {
    "use strict";
    var componentConfig = {
        require: {
            parentController: "?kiosk-controller"
        },
        bindings: {
            displayName: "<"
        },
        templateUrl: "js/kiosk/keypad-component/kiosk-keypad-component.html",
        controller: [
            "$timeout",
            "$scope",
            "fpm-utilities-factory",
            "timecard-factory",
            function ($timeout, $scope, fpmUtilitiesFactory, timecardFactory) {
                var vm = this;
                var keys = [];
                var enteredPin = "";
                vm.pinItems = [
                    { item: "1", hasIcon: false },
                    { item: "2", hasIcon: false },
                    { item: "3", hasIcon: false },
                    { item: "4", hasIcon: false },
                    { item: "5", hasIcon: false },
                    { item: "6", hasIcon: false },
                    { item: "7", hasIcon: false },
                    { item: "8", hasIcon: false },
                    { item: "9", hasIcon: false },
                    {
                        item: null,
                        hasIcon: false,
                        icon: "ion-checkmark-circled"
                    },
                    { item: "0", hasIcon: false },
                    { item: "D", hasIcon: true, icon: "ion-arrow-left-a" }
                ];
                /**
                 * REMOVING THE LAST ENTERED PIN
                 */
                function __deletePin() {
                    if (keys.length > 0) {
                        var __itemIndex = keys.length - 1;
                        keys.pop();
                        var $pinEl = document.getElementById(
                            "pin-" + __itemIndex
                        );
                        if ($pinEl) {
                            $pinEl.textContent = "";
                            $pinEl.dataset.elVal = null;
                        }
                    }
                }

                function __validatePin() {
                    if (keys.length === 4) {
                        var __newPin = keys.reduce(function (preNum, num) {
                            return preNum + num;
                        }, "");
                        if (enteredPin !== __newPin) {
                            enteredPin = __newPin;
                            fpmUtilitiesFactory
                                .showLoading("Verifying...")
                                .then(function () {
                                    timecardFactory
                                        .verifyKioskPin(enteredPin)
                                        .then(function (response) {
                                            if (
                                                response &&
                                                response.kioskEnabled
                                            ) {
                                                $scope.$emit(
                                                    "$timecard.onKioskUserVerificationCompleted",
                                                    response
                                                );
                                            } else {
                                            }
                                        })
                                        .finally(function () {
                                            fpmUtilitiesFactory.hideLoading();
                                        });
                                });
                        }
                    }
                }

                function __onPinPressed(item) {
                    if (keys.length < 4) {
                        keys.push(item.item);
                        var $pinEl = document.getElementById(
                            "pin-" + (keys.length - 1)
                        );
                        $pinEl.textContent = item.item;
                        $pinEl.dataset.elVal = "*";
                    }
                    __validatePin();
                }

                vm.events = {
                    onItemClicked: function (item) {
                        if (item && item.item) {
                            switch (item.item) {
                                case "D":
                                    __deletePin();
                                    break;
                                case "E":
                                    __validatePin();
                                    break;
                                default:
                                    __onPinPressed(item);
                                    break;
                            }
                        }
                    }
                };
                vm.$onInit = function () {};

                $scope.$on("$destroy", function () {
                    enteredPin = "";
                });
            }
        ],
        controllerAs: "vm"
    };

    angular.module("fpm").component("kioskKeypad", componentConfig);
})();
