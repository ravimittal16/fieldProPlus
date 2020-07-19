(function () {
  "use strict";

  function initController($scope, $timeout, $rootScope, $state, $ionicPopover,
    $ionicModal, $ionicActionSheet, timecardFactory, fpmUtilitiesFactory, authenticationFactory) {
    var vm = this;
    var jobCodes = {
      CLOCK_IN: 5001,
      CLOCK_OUT: 5002
    };
    var toDateString = fpmUtilitiesFactory.toStringDate;
    vm.dateFormat = $rootScope.dateFormat;
    var statusTypes = {
      NONE: 0,
      SEND_FOR_APPROVAL: 1,
      CANCELLED: 2,
      APPROVED: 3,
      UNAPPROVED: 4,
      RESENT_FOR_APPROVAL: 5
    };
    var pendingClockIns = [];
    var havingPreRoute = false
    vm.errors = [];
    vm.factory = timecardFactory;
    var alerts = fpmUtilitiesFactory.alerts;
    vm.currentDate = new Date();
    vm.showingLoading = false;
    // ==========================================================
    // TIME CARD TIME PICKER CHANGES - START
    // ==========================================================
    vm.timePicker = {
      settings: {
        timeFormat: 'hh:ii A',
        headerText: '{label} Time',
        theme: "mobiscroll",
        display: "bottom",
        swipeDirection: "vertical"
      },
      prop: null,
      instance: null,
      originalTime: null,
      currentTime: null,
      timecardObject: null,
      onTimeNewPicked: function () {
        var _timeObj = vm.timePicker.timecardObject;
        var __isClockout = _timeObj.jobCode === 5001 && vm.timePicker.prop === 'finishTime'
        var _e = angular.copy(_timeObj);
        if (__isClockout) {
          // ==========================================================
          // CLOCK OUT BUTTON CLICKED
          // ==========================================================
          _processClockOutUser(vm.timePicker.currentTime, _timeObj);
        } else {
          _timeObj[vm.timePicker.prop] = vm.timePicker.currentTime;
          _e.startTime = kendo.toString(kendo.parseDate(_timeObj.startTime), "g");
          _e.finishTime = kendo.toString(kendo.parseDate(_timeObj.finishTime), "g");
          fpmUtilitiesFactory.showLoading().then(function () {
            timecardFactory.addNewDetails(_e).then(function (response) {
              if (response.errors === null) {
                alerts.alert("Time Added", "Time has been updated.");
                if (vm.ui.data.timeCards.length !== response.timeCardDetails.length) {
                  vm.ui.data.approvalStatus = response.timeCardSummary.approveStatus || 0;
                }
                _updateTimeCardsArray(response.timeCardDetails);
              }
            }).finally(fpmUtilitiesFactory.hideLoading);
          });
        }
      },
      onTimeClicked: function (t, isForStartTime) {
        var __status = vm.ui.data.approvalStatus;
        if (__status === statusTypes.SEND_FOR_APPROVAL || __status === statusTypes.APPROVED || __status === statusTypes.RESENT_FOR_APPROVAL) {
          return false;
        }
        var __isClockout = t.jobCode === 5001 && !isForStartTime && t.finishTime === null;
        if (__isClockout) {
          var notCheckInDetails = _.filter(vm.ui.data.timeCards, function (tc) {
            return tc.finishTime === null && tc.jobCode !== jobCodes.CLOCK_IN;
          });
          if (notCheckInDetails.length > 0) {
            alerts.confirm("Confirmation!", "You have a task pending to check out. \n\n Previously pending tasks will be checked out automattically. \n\n Are you sure?", function () {
              $timeout(function () {
                __showDateTimePicker(t, isForStartTime);
              }, 20);
            });
          } else {
            alerts.confirm("Confirmation!", "Are you sure?", function () {
              $timeout(function () {
                __showDateTimePicker(t, isForStartTime);
              }, 20);
            });
          }
        } else {
          __showDateTimePicker(t, isForStartTime);
        }
      }
    };

    function __showDateTimePicker(t, isForStartTime) {
      var __headerText = 'SELECT TIME';
      if (t.jobCode === 5001) {
        __headerText = isForStartTime ? 'CLOCK IN' : 'CLOCK OUT';
      } else {
        __headerText = isForStartTime ? 'CHECK IN' : 'CHECK OUT';
      }
      vm.timePicker.prop = isForStartTime ? 'startTime' : 'finishTime';
      if (t[vm.timePicker.prop]) {
        var __dateText = kendo.toString(kendo.parseDate(t[vm.timePicker.prop]), "g");
        __headerText = __headerText + " - " + __dateText;
      }
      var __currentVal = kendo.parseDate(t[vm.timePicker.prop]);
      if (vm.timePicker.instance) {
        vm.timePicker.timecardObject = t;
        vm.timePicker.originalTime = __currentVal;
        vm.timePicker.instance.settings.headerText = __headerText;
        vm.timePicker.instance.setVal(__currentVal);
        vm.timePicker.instance.show();
      }
    }
    // ==========================================================
    // TIME CARD TIME PICKER CHANGES - END
    // ==========================================================

    function _updateBindingsForSummaryStatus(details) {
      var anythingPending = _.where(details.timeCardDetails, {
        finishTime: null
      });

      if (anythingPending.length > 0) {
        vm.ui.data.allowSendForApproval = false;
        return false;
      }
      if (vm.ui.data.approvalStatus !== statusTypes.NONE) {
        vm.ui.data.allowSendForApproval = false;
        return false;
      }
      vm.ui.data.allowSendForApproval = true;
      return true;
    }

    function _checkIfPastDateSelected() {
      $timeout(function () {
        var selected = new Date(vm.currentDate.getFullYear(), vm.currentDate.getMonth(), vm.currentDate.getDate(), 0, 0, 0, 0);
        var current = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0);
        var isPastDate = moment(selected).isBefore(current);
        var isFutureDate = moment(selected).isAfter(current);
        if (moment(selected).isSame(current)) {
          vm.ui.data.addTimeVisibility = vm.ui.data.isClockedIn;
          vm.ui.data.ptoButtonVisibility = !vm.ui.data.isClockedIn;
        }
        //    vm.ui.data.disableClockInButton = isPastDate;
        // if (vm.ui.data.isClockedOut === true) {
        //   vm.ui.data.disableClockOutButton = isPastDate;
        // }
        if (isFutureDate === true) {
          //   vm.ui.data.disableClockInButton = true;
          // vm.ui.data.addTimeVisibility = false;
          // vm.ui.data.ptoButtonVisibility = true;
        }
        if (isPastDate === true) {
          // vm.ui.data.addTimeVisibility = false;
          // vm.ui.data.ptoButtonVisibility = true;
        }
      }, 100);
    }

    function _updateTimeCardsArray(details) {

      // ==========================================================
      // We don't need the sections now
      // ==========================================================
      vm.ui.data.timeCards = details;
      // var sectionCounter = 1;
      // var ptoCounter = 1;
      // vm.ui.data.timeCards = [];
      // if (details.length > 0) {
      //   angular.forEach(details, function (s, i) {
      //     if (s.jobCode !== jobCodes.CLOCK_IN) {
      //       if (!s.isPtoType) {
      //         s.section = sectionCounter;
      //         sectionCounter++;
      //       } else {
      //         s.pto = ptoCounter;
      //         ptoCounter++;
      //       }
      //     } else {
      //       s.section = 0;
      //     }
      //     if (i === (details.length - 1)) {
      //       // vm.ui.data.timeCards = _.reject(details, {
      //       //   jobCode: jobCodes.CLOCK_IN,
      //       //   finishTime: null
      //       // });
      //       //NOTE : WE NEED TO SHOW EVERYTHING : JOY : JULY 10,2020
      //       vm.ui.data.timeCards = details;
      //     }
      //   });
      // }
    }

    function _updateTimeCardBindings(details) {
      vm.ui.data.timeCards = [];
      vm.ui.data.summary = details.timeCardSummary;
      vm.factory.summary = details.timeCardSummary;
      vm.ui.data.approvalStatus = details.timeCardSummary.approveStatus || 0;
      pendingClockIns = details.pendingClockIns;
      vm.ui.data.currentClockedIn = _.findWhere(details.timeCardDetails, {
        jobCode: jobCodes.CLOCK_IN,
        finishTime: null
      });

      _updateBindingsForSummaryStatus(details);
      if (angular.isDefined(vm.ui.data.currentClockedIn)) {
        var clockIn = vm.ui.data.currentClockedIn;
        vm.ui.data.clockInDateTime = kendo.parseDate(clockIn.startTime);
        vm.ui.data.isClockedIn = true;
        vm.ui.data.isClockedOut = clockIn.finishTime !== null;
        vm.ui.data.addTimeVisibility = !vm.ui.data.isClockedOut;
        vm.ui.data.clockOutDateTime = kendo.parseDate(clockIn.finishTime);
        vm.ui.data.clockedInDate = angular.copy(clockIn);
      }
      _checkIfPastDateSelected();

      _updateTimeCardsArray(details.timeCardDetails);
    }

    function _calculateTotalPayableTime() {
      vm.ui.data.totalTime = "0";
      //JobCode: jobCodes.CLOCK_IN 
      var payables = _.filter(vm.ui.data.timeCards, function (tc) {
        return tc.jobCode === jobCodes.CLOCK_IN && tc.finishTime !== null;
      });
      var nonPayables = _.filter(vm.ui.data.timeCards, function (tc) {
        return tc.jobCode !== jobCodes.CLOCK_IN && tc.isPayable === false && tc.finishTime !== null;
      });

      var totalPayableMins = 0;
      if (payables.length > 0) {
        angular.forEach(payables, function (e, i) {
          totalPayableMins += moment(kendo.parseDate(e.finishTime)).diff(kendo.parseDate(e.startTime), "minutes");
        });
      } else {
        vm.ui.data.totalTime = "0 hrs 0 min";
        return;
      }

      if (nonPayables.length > 0) {
        var totalNonPMins = 0;
        angular.forEach(nonPayables, function (e, i) {
          totalNonPMins += moment(kendo.parseDate(e.finishTime)).diff(kendo.parseDate(e.startTime), "minutes");
          if (i === nonPayables.length - 1) {
            totalPayableMins = totalPayableMins - totalNonPMins;
            if (totalPayableMins > 0) {
              var hours = Math.floor(totalPayableMins / 60);
              var mintues = totalPayableMins % 60;
              vm.ui.data.totalTime = hours + " hrs " + mintues + " min";
            } else {
              vm.ui.data.totalTime = "0 hrs 0 min";
            }
          }
        });
      } else {
        var hours = Math.floor(totalPayableMins / 60);
        var mintues = totalPayableMins % 60;
        vm.ui.data.totalTime = hours + " hrs " + mintues + " min";
      }
    }


    function _clearClockInData() {
      vm.ui.data.allowSendForApproval = false;
      vm.ui.data.summary = null;
      vm.ui.data.approvalStatus = 0;
      vm.ui.data.isClockedOut = false;
      vm.ui.data.summary = null;
      vm.ui.data.clockInDateTime = new Date();
      vm.ui.data.isClockedIn = false;
      vm.ui.data.addTimeVisibility = false;
      vm.ui.data.clockedInDate = null;
      vm.ui.data.timeCards = [];
      vm.ui.data.disableClockInButton = false;
      vm.ui.data.disableClockOutButton = false;
    }

    function _getTimeCardByDate() {
      _clearClockInData();
      vm.showingLoading = true;
      fpmUtilitiesFactory.showLoading().then(function () {
        timecardFactory.getTimeCardByDate(toDateString(vm.currentDate)).then(function (response) {
          if (response) {
            _updateTimeCardBindings(response);
          } else {
            _checkIfPastDateSelected();
          }
        }).finally(function () {
          vm.showingLoading = false;
          fpmUtilitiesFactory.hideLoading();
        });
      });
    }

    $ionicPopover.fromTemplateUrl('my-popover.html', {
      scope: $scope
    }).then(function (popover) {
      vm.popover = popover;
    });
    var datePickerConfig = {
      callback: function (val) {
        vm.currentDate = new Date(val);
        _getTimeCardByDate();
      },
      inputDate: vm.currentDate
    };


    function showPopoverClicked($event) {
      vm.popover.show($event);
    }
    vm.events = {
      showPopoverClicked: showPopoverClicked
    }

    function _processClockOutUser(clockInDateTime, __details) {
      var tcd = null;
      if (vm.ui.data.summary && vm.ui.data.summary.timeCardDate) {
        tcd = moment(vm.ui.data.summary.timeCardDate).toDate();
      } else {
        tcd = vm.currentDate;
      }
      var smDt = clockInDateTime ? clockInDateTime : new Date();
      var clockOutTime = new Date(smDt.getFullYear(), smDt.getMonth(), smDt.getDate(), smDt.getHours(), smDt.getMinutes(), 0, 0);
      var __num = __details ? __details.num : 0;
      var details = {
        num: __num,
        startTime: kendo.toString(clockOutTime, "g"),
        jobCode: jobCodes.CLOCK_OUT,
        numFromSummary: vm.ui.data.summary.num,
        timeCardDate: kendo.toString(kendo.parseDate(tcd), "g"),
        uniqueIdentifier: vm.ui.data.currentClockedIn.uniqueIdentifier
      };
      fpmUtilitiesFactory.showLoading().then(function () {
        timecardFactory.clockInOutUser(details).then(function (response) {
          // ==========================================================
          // TODO: NEED TO CHANGE IT
          // ==========================================================
          if (response && response.errors === null) {
            vm.ui.data.clockOutDateTime = clockOutTime;
            vm.ui.data.isClockedOut = true;
            vm.ui.data.isClockedIn = false;
            vm.ui.data.disableClockOutButton = true;
            vm.ui.data.addTimeVisibility = false;
            vm.ui.data.ptoButtonVisibility = true;
            vm.ui.data.summary = response.timeCardSummary;
            vm.factory.summary = response.timeCardSummary;
            var dt = vm.currentDate ? vm.currentDate : new Date();
            var cDate = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0);

            var tcDate = new Date(tcd.getFullYear(), tcd.getMonth(), tcd.getDate(), 0, 0, 0, 0);
            if (moment(tcDate).isSameOrAfter(cDate)) {
              vm.ui.data.disableClockInButton = false;
            }
            vm.ui.data.approvalStatus = response.timeCardSummary.approveStatus || 0;
            _updateTimeCardsArray(response.timeCardDetails);
            _updateBindingsForSummaryStatus(response);

          } else {
            alerts.alert("Error", "Not able to perform clock out");
          }
        }).finally(function () {
          fpmUtilitiesFactory.hideLoading();
        });
      });
    }

    function showModal() {
      if (vm.ui.data.isFromPto === true && vm.ui.data.summary === null) {
        vm.ui.data.summary = {
          num: 0,
          timeCardDate: vm.currentDate
        };
        vm.factory.summary = vm.ui.data.summary;
      }
      if (vm.ui.data.addEditDetailsModal === null) {
        $ionicModal.fromTemplateUrl("timecardDetailsModal.html", {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function (modal) {
          vm.ui.data.addEditDetailsModal = modal;
          $timeout(function () {
            $scope.$broadcast("timecard:addEditDetailsModal:open", {
              isFromPto: vm.ui.data.isFromPto,
              details: vm.ui.data.currentDetails,
              editMode: vm.ui.data.isInEditMode,
              currentDate: vm.currentDate
            });
            modal.show();
          }, 300);
        });
      } else {
        $scope.$broadcast("timecard:addEditDetailsModal:open", {
          isFromPto: vm.ui.data.isFromPto,
          details: vm.ui.data.currentDetails,
          editMode: vm.ui.data.isInEditMode,
          currentDate: vm.currentDate
        });
        vm.ui.data.addEditDetailsModal.show();
      }
    }

    function showSummaryModal() {
      if (vm.ui.data.timeCardSummaryModal === null) {
        $ionicModal.fromTemplateUrl("timecardSummaryModal.html", {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function (modal) {
          vm.ui.data.timeCardSummaryModal = modal;
          $scope.$broadcast("timecard:timeCardSummaryModal:open");
          vm.ui.data.timeCardSummaryModal.show();
        });
      } else {
        $scope.$broadcast("timecard:timeCardSummaryModal:open");
        vm.ui.data.timeCardSummaryModal.show();
      }
    }

    function showTutorialModal() {
      if (vm.ui.data.timecardTutorialModal === null) {
        $ionicModal.fromTemplateUrl("timecardTutorialModal.html", {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function (modal) {
          vm.ui.data.timecardTutorialModal = modal;
          vm.ui.data.timecardTutorialModal.show();
        });
      } else {
        vm.ui.data.timecardTutorialModal.show();
      }
    }

    function onCurrentDateChanged(event) {
      _getTimeCardByDate();
    }

    function onShowCalenderClick() {
      if (angular.isDefined(vm.ui.calendar.control)) {
        vm.ui.calendar.control.show();
      }
    }
    var timeoutvar = null;
    vm.ui = {
      errors: [],
      calendar: {
        settings: {
          theme: "mobiscroll",
          display: "bottom",
          swipeDirection: "vertical"
        }
      },
      data: {
        componentEvents: null,
        summary: null,
        currentDate: new Date(),
        isClockedIn: false,
        isClockedOut: false,
        clockInDateTime: new Date(),
        clockOutDateTime: new Date(),
        addTimeVisibility: false,
        clockedInDate: null,
        timeCards: [],
        approvalStatus: 0,
        disableClockInButton: false,
        disableClockOutButton: false,
        currentClockedIn: null,
        allowSendForApproval: false,
        totalTime: "",
        enableForCustomer: false,
        ptoButtonVisibility: false,
        isFromPto: false,
        isInEditMode: false,
        addEditDetailsModal: null,
        timeCardSummaryModal: null,
        currentDetails: null,
        timecardTutorialModal: null
      },
      events: {
        refreshOnPullDown: function () {
          _getTimeCardByDate();
        },
        onClockInOutActionClicked: function (detail) {
          var hideSheet = $ionicActionSheet.show({
            destructiveText: 'Clear Clock-Out Time',
            titleText: 'Time Card Options',
            cancel: function () {},
            destructiveButtonClicked: function () {
              // ==========================================================
              // Checking the pending clock-out counts
              // ==========================================================
              var _pendingClockout = vm.ui.data.timeCards.filter(function (t) {
                return t.jobCode === jobCodes.CLOCK_IN && t.finishTime === null;
              })
              if (_pendingClockout.length > 0) {
                // TODO : NEED TO CHANGE THE MESSAGE
                hideSheet();
                alerts.alert("Warning", "You cannot have multiple Clock Out.");
                return false;
              }
              alerts.confirm("Confirmation!", "Are you sure?", function () {
                hideSheet();
                fpmUtilitiesFactory.showLoading().then(function () {
                  timecardFactory.clearClockOutTime(detail.num).then(function (response) {
                    if (response) {
                      $timeout(function () {
                        _getTimeCardByDate();
                      });
                    }
                  }).finally(function () {
                    fpmUtilitiesFactory.hideLoading();
                  });
                });
              }, function () {
                hideSheet();
              });

            }
          });

          // $timeout(function () {
          //   hideSheet();
          // }, 5000);
        },
        checkOutPending: function (details) {
          alerts.confirm("Confirmation!", "Are you sure?", function () {
            var tcd = kendo.parseDate(details.timeCardDate);
            var _e = angular.copy(details);
            var _ft = moment(new Date(tcd.getFullYear(), tcd.getMonth(), tcd.getDate(), new Date().getHours(), new Date().getMinutes(), 0, 0));
            var _st = kendo.parseDate(_e.startTime);
            if (_ft.isBefore(_st)) {
              alerts.alert("Invalid Time", "Please enter finish time manually.", function () {
                $timeout(function () {
                  vm.ui.data.currentDetails = _e;
                  vm.ui.data.isInEditMode = true;
                  vm.ui.data.isFromPto = _e.isPtoType;
                  showModal();
                }, 100);
              });
            } else {
              _e.finishTime = kendo.toString(new Date(tcd.getFullYear(), tcd.getMonth(), tcd.getDate(), new Date().getHours(), new Date().getMinutes(), 0, 0), "g");
              fpmUtilitiesFactory.showLoading().then(function () {
                timecardFactory.addNewDetails(_e).then(function (response) {
                  if (response) {
                    $timeout(function () {
                      _getTimeCardByDate();
                    });
                  }
                }).finally(function () {
                  fpmUtilitiesFactory.hideLoading();
                });
              });
            }
          });
        },
        onShowCalenderClick: onShowCalenderClick,
        onCurrentDateChanged: onCurrentDateChanged,
        onTutorialModalCancel: function () {
          if (vm.ui.data.timecardTutorialModal) {
            vm.ui.data.timecardTutorialModal.hide();
          }
        },
        onSummaryModalCancel: function () {
          vm.ui.data.timeCardSummaryModal.hide();
        },
        checkSummaryClick: function () {
          showSummaryModal();
          vm.popover.hide();
          return true;
        },
        showTimeCardTutorialWindow: function () {
          vm.popover.hide();
          showTutorialModal();
          return true;
        },
        onAddScheduleCompleted: function (o) {
          if (vm.ui.data.timeCards.length !== o.timeCardDetails.length) {
            vm.ui.data.approvalStatus = o.timeCardSummary.approveStatus || 0;
          }
          _updateTimeCardsArray(o.timeCardDetails);
          vm.ui.data.addEditDetailsModal.hide();
        },
        onModalCancelClicked: function () {
          vm.ui.data.isInEditMode = false;
          vm.ui.data.isFromPto = false;
          vm.ui.data.currentDetails = null;
          vm.ui.data.addEditDetailsModal.hide();
        },
        addTimeClick: function (isFromPto) {
          $timeout(function () {
            vm.ui.data.isFromPto = isFromPto;
            vm.ui.data.isInEditMode = false;
            vm.ui.data.currentDate = vm.currentDate;
            showModal();
          }, 100);
          vm.popover.hide();
          return true;
        },
        onCardActionClicked: function (t) {
          $ionicActionSheet.show({
            buttons: [{
              text: 'Edit'
            }],
            destructiveText: 'Delete',
            titleText: 'Time Card Options',
            cancelText: 'Cancel',
            cancel: function () {},
            destructiveButtonClicked: function () {
              if (!t.isUserDefined) {
                alerts.alert("Invalid Action", "You are not allowed to perform delete");
              } else {
                alerts.confirmDelete(function () {
                  fpmUtilitiesFactory.showLoading().then(function () {
                    timecardFactory.deleteTimeCardDetails(t.num, t.numFromSummary)
                      .then(function (response) {
                        if (response) {
                          alerts.alert("Success", "Time Details cleared successfully", function () {
                            _updateTimeCardsArray(response.timeCardDetails);
                          });
                        }
                      }).finally(fpmUtilitiesFactory.hideLoading);
                  });
                });
              }
              return true;
            },
            buttonClicked: function (index) {
              if (index === 0) {
                vm.ui.data.currentDetails = t;
                $timeout(function () {
                  vm.ui.data.isInEditMode = true;
                  vm.ui.data.isFromPto = t.isPtoType;
                  showModal();
                }, 200);
              }
              return true;
            }
          });
        },
        sendForApproval: function (status) {
          if (angular.isArray(vm.ui.data.timeCards) && vm.ui.data.timeCards.length === 0) {
            alerts.alert("No Timecard!", "No Timecard information found to process this request.");
            return false;
          }
          alerts.confirm("Confirmation!", "Are you sure?", function () {
            fpmUtilitiesFactory.showLoading().then(function () {
              timecardFactory.sendForApproval(vm.ui.data.summary.num, status).then(function (response) {
                if (response) {
                  vm.ui.data.summary = response.timeCardSummary;
                  alerts.alert("Success", "Time card sent for approval successfully");
                  vm.ui.data.addTimeVisibility = false;
                  vm.ui.data.ptoButtonVisibility = false;
                  vm.ui.data.approvalStatus = vm.ui.data.summary.approveStatus;
                }
              }).finally(fpmUtilitiesFactory.hideLoading);
            });
          });
        },
        clockOutClick: function (clockInDate, detail) {
          var notCheckInDetails = _.filter(vm.ui.data.timeCards, function (tc) {
            return tc.finishTime === null && tc.jobCode !== jobCodes.CLOCK_IN;
          });
          if (notCheckInDetails.length > 0) {
            alerts.confirm("Confirmation!", "You have a task pending to check out. \n\n Previously pending tasks will be checked out automattically. \n\n Are you sure?", function () {
              _processClockOutUser(clockInDate, detail);
            });
          } else {
            alerts.confirm("Confirmation!", "Are you sure?", function () {
              _processClockOutUser(clockInDate, detail);
            });
          }
        },
        clockInClick: function () {
          var tcDate = vm.currentDate;
          var smDt = new Date();
          var clockInTime = new Date(smDt.getFullYear(), smDt.getMonth(), smDt.getDate(), new Date().getHours(), new Date().getMinutes(), 0, 0);
          var timeCardDate = new Date(tcDate.getFullYear(), tcDate.getMonth(), tcDate.getDate(), new Date().getHours(), new Date().getMinutes(), 0, 0);
          var details = {
            startTime: fpmUtilitiesFactory.toStringDate(clockInTime),
            jobCode: jobCodes.CLOCK_IN,
            numFromSummary: vm.ui.data.summary === null ? 0 : vm.ui.data.summary.Num,
            timeCardDate: timeCardDate
          };
          vm.errors = [];
          fpmUtilitiesFactory.showLoading().then(function () {
            timecardFactory.clockInOutUser(details).then(function (response) {
              if (response.errors === null) {
                vm.ui.data.clockInDateTime = clockInTime;
                vm.ui.data.isClockedIn = true;
                vm.ui.data.disableClockOutButton = false;
                vm.ui.data.addTimeVisibility = true;
                vm.ui.data.ptoButtonVisibility = false;
                alerts.alert("Clocked In", "Clocked in successfully", function () {
                  if (havingPreRoute === true) {
                    $state.go($stateParams.proute);
                  } else {
                    _updateTimeCardBindings(response);
                  }
                });
              } else {
                vm.errors = response.errors;
              }
            }).then(function () {
              fpmUtilitiesFactory.hideLoading();
            });
          });
        }
      }
    };
    var customerNumberList = [{
      c: "407805491"
    }, {
      c: "1238967820"
    }];

    function activateController() {
      _getTimeCardByDate();
      var userInfo = authenticationFactory.getLoggedInUserInfo();
      var havingCustomrNumber = _.findWhere(customerNumberList, {
        c: userInfo.customerNumber
      });
      vm.ui.data.enableForCustomer = angular.isDefined(havingCustomrNumber);
      vm.dateFormat = userInfo.dateFormat;
      if (userInfo) {
        vm.userName = userInfo.userName;
      }
      $ionicModal.fromTemplateUrl("timecardDetailsModal.html", {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        vm.ui.data.addEditDetailsModal = modal;
      });
    }

    $scope.$watch("vm.ui.data.timeCards", function (nw) {
      vm.factory.details = nw;
      if (angular.isDefined(nw)) {
        _calculateTotalPayableTime();
      }
    }, true);
    $scope.$on("$destroy", function () {
      if (timeoutvar) {
        $timeout.cancel(timeoutvar)
      }
    });
    $scope.$on("$ionicView.beforeEnter", function (e, data) {
      activateController();
    });
  }
  initController.$inject = ["$scope", "$timeout", "$rootScope", "$state", "$ionicPopover", "$ionicModal",
    "$ionicActionSheet", "timecard-factory", "fpm-utilities-factory", "authenticationFactory"
  ];
  angular.module("fpm").controller("timecard-controller", initController);
})();
