(function () {
    "use strict";
    angular.module("fpm").component("expanseItem", {
        bindings: {
            item: "<",
            itemIndex: "<",
            ondeleteClicked: "&",
            oneditClicked: "&",
            isPaidList: "<"
        },
        controller: ["$scope","authenticationFactory",function ($scope,authenticationFactory) {
            var vm = this;
            vm.user = authenticationFactory.getLoggedInUserInfo();
            vm.dateFormat=vm.user.dateFormat;
            vm.events = {
                onEditClicked: function () {
                    if (angular.isDefined(vm.oneditClicked)) {
                        vm.oneditClicked({ value: vm.item });
                    }
                },
                onDeleteClicked: function () {
                    if (angular.isDefined(vm.ondeleteClicked)) {
                        vm.ondeleteClicked({ value: vm.item, index: vm.itemIndex, isfrompaid: vm.isPaidList });
                    }
                }
            };
        }],
        controllerAs: "vm",
        templateUrl: "js/expanses/expanse-item-template.html"
    })
})();