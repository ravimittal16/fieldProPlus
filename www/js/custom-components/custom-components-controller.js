(function () {
  "use strict";

  function _initController($scope, $state, customComponentsFactory, authenticationFactory) {

    var vm = this;
    vm.showingLoading = false;
    vm.userInfo = authenticationFactory.getLoggedInUserInfo();
    vm.dateFormat = vm.userInfo.dateFormat;
    vm.reportModel = {
      startDate: null,
      endDate: null
    };
    var _staticColumsName = {
      "BarcodeName": "Wo#",
      "ActualStartDateTime": "Start Date"
    }
    vm.events = {
      onChildGroupClicked: function (_component) {
        _component.isOpen = !_component.isOpen;
      },
      refreshOnPullDown: function () {
        _getComponents();
        $scope.$broadcast("scroll.refreshComplete");
      },
      runReport: function () {
        vm.columns = [];
        var reportColumns = [];
        customComponentsFactory.generateReport(vm.reportModel).then(function (response) {
          var $table = angular.element("#tableReport");
          $table.find("tbody").html("");
          if (response) {
            vm.result = JSON.parse(response);
            if (vm.result && vm.result.length > 0) {
              var firstRow = vm.result[0];
              for (var s in firstRow) {
                reportColumns.push(s);
                if (s === "BarcodeName" || s === "ActualStartDateTime") {
                  vm.columns.push({
                    colName: _staticColumsName[s]
                  })
                } else {
                  vm.columns.push({
                    colName: s
                  })
                }
              }

              angular.forEach(vm.result, function (e, i) {
                var tableRow = "<tr>"
                if ((vm.result.length - 1) === i) {
                  var tableRow = "<tr class='success'>"
                }
                var dateFormat = vm.dateFormat.toUpperCase();
                angular.forEach(reportColumns, function (col, x) {
                  var val = "";
                  if (col === "ActualStartDateTime") {
                    if (e[col] && vm.dateFormat) {
                      val = moment(e[col]).format(dateFormat);
                    }
                  } else {
                    val = (e[col] || "");
                  }
                  tableRow += "<td>" + val + "</td>";
                  if (x === (reportColumns.length - 1)) {
                    tableRow += "</tr>"
                    $table.find("tbody").append(tableRow);
                  }
                });
              })
            }
          }
        });
      }
    }

    function _getComponents() {
      customComponentsFactory.getComponents().then(function (response) {
        vm.showEmptyMessage = response === null;
        if (angular.isArray(response)) {
          var _compos = [];
          angular.forEach(response, function (s, i) {
            s.isOpen = false;
            _compos.push(s);
            if (i === (response.length - 1)) {
              vm.components = _compos;
            }
          });
        }
      });
    }

    function activateController() {
      _getComponents();
    }
    $scope.$on("$ionicView.afterEnter", function (e, data) {
      activateController();
    });
  }
  _initController.$inject = ["$scope", "$state", "custom-components-factory", "authenticationFactory"];
  angular.module("fpm").controller("custom-components-controller", _initController);
})();
