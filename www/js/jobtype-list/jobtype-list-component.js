(function() {
  "use strict";
  var componentConfig = {
    bindings: {
      barcode: "<",
      jobtype: "<"
    },
    controller: [
      "$scope",
      "$timeout",
      "custom-types-factory",
      "authenticationFactory",
      function($scope, $timeout, customTypesFactory,authenticationFactory) {
        var vm = this;
        vm.factory = customTypesFactory;
        vm.userInfo=authenticationFactory.getLoggedInUserInfo();
        vm.dateFormat= vm.userInfo.dateFormat;
        var controlTypes = customTypesFactory.controlTypes;
        vm.isExpanded = false;
        var counter = 0;
        vm.customTypes = {
          data: []
        };
        vm.gettingCustomTypes = false;
        function updateToDatabase(type, dateType) {
          var o = angular.copy(type);
          var cbox = false;
          if (dateType && o.value) {
            o.value = kendo.toString(kendo.parseDate(type.value), "g");
          }
          if (type.type === 3) {
            cbox = type.value;
          }
          o.dataEntityType = 1;
          o.entityKey = vm.barcode;
          customTypesFactory.updateData(o, cbox).then(function(response) {
            if (response) {
              type.id = response.id;
            }
          });
        }
        vm.events = {
          makeValueAsNull: function(id) {
            loadTypesData();
          },
          onExpandClicked: function() {
            vm.isExpanded = !vm.isExpanded;
          },
          onValueChanged: function(type) {
            if (type.type === 4) {
              if (counter === 0) {
                updateToDatabase(type, true);
                counter++;
              } else {
                counter = 0;
              }
            } else {
              updateToDatabase(type);
            }
          }
        };
        function loadTypesData() {
          if (vm.jobtype === null) {
            vm.factory.requestDataCompleted = true;
            return;
          }
          vm.gettingCustomTypes = true;
          customTypesFactory
            .getCustomTypesDataByBarcode(vm.barcode, vm.jobtype)
            .then(function(response) {
              vm.gettingCustomTypes = false;
              if (response && response.length > 0) {
                var checkBoxes = _.where(response, {
                  type: controlTypes.CHECKBOX
                });
                angular.forEach(checkBoxes, function(e) {
                  e.value =
                    e.value === "true" || e.value === "True" || e.value === "1";
                });
                vm.customTypes.data = response;
                vm.factory.viewData = vm.customTypes.data;
              }
            })
            .finally(function() {
              vm.factory.requestDataCompleted = true;
            });
        }
        vm.$onInit = function() {
          vm.customTypes.data = [];
          vm.factory.viewData = [];
          vm.factory.requestDataCompleted = false;
          loadTypesData();
        };
      }
    ],
    controllerAs: "vm",
    templateUrl: "js/jobtype-list/jobtype-list-component-template.html"
  };
  angular.module("fpm").component("jobtypeListComponent", componentConfig);
})();
