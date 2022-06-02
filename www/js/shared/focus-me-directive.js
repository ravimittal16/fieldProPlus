(function () {
    "use strict";
    var fpm = angular.module("fpm");
    fpm.directive("focusMe", [
        "$timeout",
        function ($timeout) {
            return {
                link: function (scope, element, attrs) {
                    scope.$on("modal.shown", function () {
                        $timeout(function () {
                            element[0].focus();
                            if (ionic.Platform.isAndroid()) {
                                cordova.plugins.Keyboard.show();
                            }
                        }, 750);
                    });
                }
            };
        }
    ]);

    function _growTextbox() {
        return {
            link: function (scope, element, attrs) {
                setTimeout(function () {
                    $(element).autogrow({ vertical: true, horizontal: false });
                }, 1000);
            },
            restrict: "A"
        };
    }

    fpm.directive("autoGrow", _growTextbox);

    fpm.directive("fieldPromaxTitle", [
        "$timeout",
        function ($timeout) {
            return {
                link: function (scope, element, attrs) {
                    console.log(element);
                }
            };
        }
    ]);

    function arrayBufferToBase64(buffer) {
        var binary = "";
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    function downloadImageFromBlob() {
        return {
            restrict: "A",
            scope: {
                imageId: "<",
                imageElId: "@",
                downloadThumb: "<"
            },
            bindToController: true,
            controllerAs: "vm",
            controller: [
                "shared-data-factory",
                function (sharedDataFactory) {
                    var vm = this;

                    function downloadImageFromBlob(imageId) {
                        sharedDataFactory
                            .downloadImageFromBlob(imageId, vm.downloadThumb)
                            .then(function (response) {
                                if (response) {
                                    var __base64String =
                                        arrayBufferToBase64(response);
                                    if (
                                        __base64String &&
                                        __base64String !== ""
                                    ) {
                                        var imageEl = document.getElementById(
                                            vm.imageElId
                                        );
                                        if (imageEl) {
                                            imageEl.src =
                                                "data:image/png;base64," +
                                                __base64String;
                                        }
                                    }
                                }
                            });
                    }
                    vm.$onInit = function () {
                        if (vm.imageId) {
                            downloadImageFromBlob(vm.imageId);
                        }
                    };
                }
            ]
        };
    }

    fpm.directive("blobImage", downloadImageFromBlob);
})();
