(function () {
    "use strict";
    var componentConfig = {
        bindings: {
            onCancelClicked: "&"
        },
        controller: ["$scope", "$ionicActionSheet", "timecard-factory", "fpm-utilities-factory",
            function ($scope, $ionicActionSheet, timecardFactory, fpmUtilitiesFactory) {
                var vm = this;
                var codes = timecardFactory.data.jobCodes;
                vm.lists = { clockInOuts: [], payables: [], nonPayables: [] };
                vm.modal = { startDate: null, endDate: null };
                function closeProductEditModal() {
                    if (angular.isFunction(vm.onCancelClicked)) {
                        vm.onCancelClicked();
                    }
                }
                function showReport(showCurrent) {
                    vm.showCurrentSummary = showCurrent;
                    if (!showCurrent) {
                        vm.payableReport = [];
                        var report = [];
                        timecardFactory.getSummaryPayableHours({ startDate: vm.modal.startDate, finishDate: vm.modal.endDate }).then(function (response) {
                            if (response && response.length > 0) {
                                angular.forEach(response, function (r, i) {
                                    var isExists = _.findWhere(report, { timeCardDate: r.timeCardDate });
                                    var totalMintues = parseFloat(parseInt(r.totalMinutes, 10) / 60).toFixed(2);
                                    if (angular.isDefined(isExists)) {
                                        if (r.IsPayable) {
                                            isExists.payableHours = parseFloat(totalMintues);
                                        } else {
                                            isExists.nonPayable = parseFloat(totalMintues);
                                        }
                                        isExists.total = parseFloat(isExists.payableHours) + parseFloat(isExists.nonPayable);
                                    } else {
                                        report.push({
                                            timeCardDate: r.timeCardDate,
                                            payableHours: r.isPayable === true ? parseFloat(totalMintues) : 0,
                                            nonPayable: r.isPayable === false ? parseFloat(totalMintues) : 0,
                                            total: parseFloat(totalMintues).toFixed(2)
                                        });
                                    }
                                    if (i === response.length - 1) {
                                        vm.payableReport = report;
                                        _.forEach(report, function (d) {
                                            vm.totalPayables.p += parseFloat(d.payableHours);
                                            vm.totalPayables.np += parseFloat(d.nonPayable);
                                            vm.totalPayables.t += parseFloat(d.total);
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
                function onCardActionClicked() {
                    $ionicActionSheet.show({
                        buttons: [
                            { text: 'Show Current' }, { text: "As Selected Dates" }
                        ],
                        titleText: 'Time card Report',
                        cancelText: 'Cancel',
                        cancel: function () {

                        },
                        buttonClicked: function (index) {
                            if (index === 0) {
                                if (vm.showCurrentSummary === false) {
                                    processCurrent();
                                } else {
                                    vm.showCurrentSummary = false;
                                }
                            }
                            return true;
                        }
                    });
                }
                vm.events = { closeProductEditModal: closeProductEditModal, showReport: showReport, onCardActionClicked: onCardActionClicked };
                function processCurrent() {
                    vm.lists = { clockInOuts: [], payables: [], nonPayables: [] };
                    fpmUtilitiesFactory.showLoading().then(function () {
                        if (angular.isArray(timecardFactory.details) && timecardFactory.details.length > 0) {
                            vm.lists.clockInOuts = _.where(timecardFactory.details, { jobCode: codes.CLOCK_IN });
                            var sections = _.reject(timecardFactory.details, { jobCode: codes.CLOCK_IN });
                            vm.lists.payables = _.where(sections, { isPayable: true });
                            vm.lists.nonPayables = _.where(sections, { isPayable: false });
                        }
                        fpmUtilitiesFactory.hideLoading();
                    });
                    vm.showCurrentSummary = true;
                }
                vm.$onInit = function () {
                    processCurrent();
                }
                $scope.$on("timecard:timeCardSummaryModal:open", function () {
                    processCurrent();
                });
            }],
        controllerAs: "vm",
        templateUrl: "js/timecard/timecard-summary-component.template.html"
    };
    angular.module("fpm").component("timecardSummaryComponent", componentConfig);
})();