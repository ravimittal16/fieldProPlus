(function () {
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
      "fpm-utilities-factory",
      function (
        $scope,
        $timeout,
        customTypesFactory,
        authenticationFactory,
        fpmUtilitiesFactory
      ) {
        var vm = this;
        vm.factory = customTypesFactory;
        var alerts = fpmUtilitiesFactory.alerts;
        vm.userInfo = authenticationFactory.getLoggedInUserInfo();
        vm.dateFormat = vm.userInfo.dateFormat;
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
          customTypesFactory.updateData(o, cbox).then(function (response) {
            if (response) {
              type.id = response.id;
              if (vm.clones.toolbar.currentIndex > -1) {
                assigneValueChanges(response);
              }
            }
          });
        }
        // ===============================================================================
        function assigneValueChanges(entity) {
          if (entity) {
            var _dataValues = _.findWhere(vm.clones.clonesData, {
              id: entity.id
            });
            if (_dataValues) {
              var _index = _.indexOf(vm.clones.clonesData, _dataValues);
              if (_index > -1) {
                vm.clones.clonesData[_index].value = entity.value;

              }
            } else {
              vm.clones.clonesData.push(entity);
            }
          }
        }

        function _updateFormData() {
          vm.clones.currentDefination = null;
          if (vm.clones.toolbar.preIndex === -1) {
            vm.clones.parentData = angular.copy(vm.customTypes.data);
          }
          if (vm.clones.toolbar.currentIndex === -1) {
            vm.customTypes.data = angular.copy(vm.clones.parentData);
          } else {
            var d = vm.clones.clones[vm.clones.toolbar.currentIndex];
            if (d) {
              vm.clones.currentDefination = d;
              $timeout(function () {
                var cloneData = _.where(vm.clones.clonesData, {
                  cloneRefId: d.num
                });
                angular.forEach(vm.customTypes.data, function (item, index) {
                  var clone = _.findWhere(cloneData, {
                    typeId: item.typeId
                  });
                  item["id"] = clone !== undefined ? clone.id : 0;
                  if (item.type === 3) {
                    item["value"] = clone !== undefined ? clone.value.toString().toUpperCase() === 'TRUE' : false;
                  } else {
                    item["value"] = clone !== undefined ? clone.value : null;
                  }
                  item["cloneRefId"] = d.num;
                  if (index === vm.customTypes.data.length - 1) {}
                });

              }, 100);
            }
          }
        }

        function _goToLastIndex() {
          vm.clones.toolbar.preIndex = vm.clones.toolbar.currentIndex;
          vm.clones.toolbar.currentIndex = vm.clones.clones.length - 1;
          _updateFormData();
        }

        vm.clones = {
          toolbar: {
            message: "",
            preIndex: 0,
            currentIndex: -1
          },
          currentDefination: null,
          cloneModel: null,
          clones: [],
          clonesData: [],
          parentData: null
        };
        //================================================================================
        vm.events = {
          assignValue: function (entity) {
            if (vm.clones.toolbar.currentIndex > -1) {
              assigneValueChanges(entity);
            }
          },
          toolbar: {
            deleteClicked: function () {
              if (vm.clones.toolbar.currentIndex > -1) {
                alerts.confirm("Confirmation!", "Are you sure?", function () {
                  var d = vm.clones.currentDefination;
                  if (d) {
                    customTypesFactory
                      .deleteClone(d.num)
                      .then(function () {})
                      .finally(function () {
                        var _index = _.indexOf(vm.clones.clones, d);
                        vm.clones.clones.splice(_index, 1);
                        vm.events.toolbar.previousClicked();
                        alerts.alert(
                          "Success",
                          "Information has been deleted.",
                          function () {}
                        );
                      });
                  }
                });
              }
            },
            addAnotherList: function () {
              vm.uiErrors = [];
              if (vm.clones.cloneModel && vm.jobtype) {
                customTypesFactory
                  .createClone(vm.clones.cloneModel)
                  .then(
                    function (response) {
                      if (response && response.num > 0) {
                        vm.clones.clones.push(response);
                        _goToLastIndex();
                      } else {
                        vm.uiErrors.push("Error while creating clone.");
                      }
                    },
                    function () {}
                  )
                  .finally();
              }
            },
            previousClicked: function () {
              if (vm.clones.clones.length > 0) {
                vm.clones.toolbar.preIndex = vm.clones.toolbar.currentIndex;
                if (vm.clones.toolbar.currentIndex === -1) {
                  vm.clones.toolbar.currentIndex = vm.clones.clones.length - 1;
                } else {
                  vm.clones.toolbar.currentIndex -= 1;
                }
                _updateFormData();
              }
            },
            nextClicked: function () {
              if (vm.clones.clones.length > 0) {
                vm.clones.toolbar.preIndex = vm.clones.toolbar.currentIndex;
                if (
                  vm.clones.toolbar.currentIndex ===
                  vm.clones.clones.length - 1
                ) {
                  vm.clones.toolbar.currentIndex = -1;
                } else {
                  vm.clones.toolbar.currentIndex += 1;
                }
                _updateFormData();
              }
            }
          },
          makeValueAsNull: function (id) {
            //OLD loadTypesData();

            var _dataObj = _.findWhere(vm.customTypes.data, {
              id: id
            });
            if (_dataObj !== undefined) {
              _dataObj.value = null;
              _dataObj.id = 0;
            }
            if (vm.clones.toolbar.currentIndex > -1) {
              var cloneData = _.findWhere(vm.clones.clonesData, {
                id: id
              });
              if (cloneData !== undefined) {
                cloneData.value = null;
              }
            }
          },
          onExpandClicked: function () {
            vm.isExpanded = !vm.isExpanded;
          },
          onValueChanged: function (type) {
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

        function getClones() {
          customTypesFactory
            .getWorkOrderClones(vm.barcode, vm.jobtype)
            .then(function (response) {
              if (response) {
                vm.clones.clones = response.clones;
                vm.clones.clonesData = response.clonesData;
              }
            })
            .finally(function () {});
        }

        function _initCloneModel() {
          vm.clones.cloneModel = {
            entityId: vm.jobtype,
            entityType: 4,
            refEntityId: vm.barcode,
            refEntityType: 1
          };
          getClones();
        }

        function loadTypesData() {
          if (vm.jobtype === null) {
            vm.factory.requestDataCompleted = true;
            return;
          }
          vm.gettingCustomTypes = true;
          customTypesFactory
            .getCustomTypesDataByBarcode(vm.barcode, vm.jobtype)
            .then(function (response) {
              vm.gettingCustomTypes = false;
              if (response && response.length > 0) {
                var checkBoxes = _.where(response, {
                  type: controlTypes.CHECKBOX
                });
                angular.forEach(checkBoxes, function (e) {
                  e.value =
                    e.value === "true" || e.value === "True" || e.value === "1";
                });
                vm.customTypes.data = response;
                vm.factory.viewData = vm.customTypes.data;
              }
            })
            .finally(function () {
              vm.factory.requestDataCompleted = true;
            });
        }

        vm.$onInit = function () {
          vm.customTypes.data = [];
          vm.factory.viewData = [];
          vm.factory.requestDataCompleted = false;
          loadTypesData();

          _initCloneModel(false);
        };
      }
    ],
    controllerAs: "vm",
    templateUrl: "js/jobtype-list/jobtype-list-component-template.html"
  };
  angular.module("fpm").component("jobtypeListComponent", componentConfig);
})();
