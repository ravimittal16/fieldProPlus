(function () {
  "use strict";

  function initFactory(apicontext, $rootScope, $q, $cacheFactory) {
    var baseUrl = "api/timecard/";
    var cache = $cacheFactory("timeCardCache");

    var jobCodes = {
      CLOCK_IN: 5001,
      CLOCK_OUT: 5002
    };

    function getTimeCardByDate(date, userEmail) {
      var __userEmail = userEmail ? userEmail : "";
      return apicontext.get(baseUrl + "GetTimeCardByDate?date=" + encodeURIComponent(date) + "&userEmail=" + encodeURIComponent(__userEmail));
    }

    function _attachLocationCoordinates(postObj) {
      var _loction = $rootScope.currentLocation;
      var _coords = _loction !== undefined ? _loction.coords : {};
      if (_coords && _coords["latitude"] !== undefined) {
        postObj["coordinateX"] = _coords["longitude"];
        postObj["coordinateY"] = _coords["latitude"];
      }
      return postObj;
    }

    function getClockInByDate(date) {
      return apicontext.get(baseUrl + "GetClockInByDate?date=" + date);
    }

    function clockInOutUser(details) {
      var _p = _attachLocationCoordinates(details);
      return apicontext.post(baseUrl + "ClockInOutUser", _p);
    }

    function getJobCodes(forceGet) {
      forceGet = forceGet || false;
      if (forceGet === true) {
        cache.remove("jobCodes");
      }
      var jobCodes = cache.get("jobCodes");
      if (angular.isDefined(jobCodes) && jobCodes) {
        return $q.when(jobCodes);
      } else {
        return apicontext.get(baseUrl + "GetJobCodes").then(function (response) {
          cache.put("jobCodes", response);
          return response;
        });
      }
    }

    function getWorkOrdersList(forceGet) {
      forceGet = forceGet || false;
      if (forceGet === true) {
        cache.remove("workorders");
      }
      var orders = cache.get("workorders");
      if (angular.isDefined(orders) && orders) {
        return $q.when(orders);
      } else {
        return apicontext.get(baseUrl + "GetWorkOrdersList").then(function (response) {
          cache.put("workorders", response);
          return response;
        });
      }
    }

    function addNewDetails(entity) {
      var _entity = _attachLocationCoordinates(entity);
      return apicontext.post(baseUrl + "AddNewDetails", _entity);
    }

    function clearCheckedOutTime(detailId, summaryId) {
      return apicontext.get(baseUrl + "ClearCheckedOutTime?detailId=" + detailId + "&summaryId=" + summaryId);
    }

    function sendForApproval(summaryId, status) {
      return apicontext.get(baseUrl + "SendForApproval?summaryId=" + summaryId + "&status=" + status);
    }

    function deleteTimeCardDetails(detailId, summaryId) {
      return apicontext.get(baseUrl + "DeleteTimeCardDetails?detailId=" + detailId + "&summaryId=" + summaryId);
    }

    function clearTimeCard(summaryId) {
      return apicontext.get(baseUrl + "ClearTimeCard?summaryId=" + summaryId);
    }

    function getPendingClockIns() {
      return apicontext.get(baseUrl + "GetPendingClockIns");
    }

    function pushCheckInOutTimes(entity) {
      var _entity = _attachLocationCoordinates(entity);
      return apicontext.post(baseUrl + "PushCheckInOutTimes", _entity);
    }

    function certifyUser() {
      return apicontext.get(baseUrl + "CertifieldUser");
    }

    function getCertifieldUser() {
      return apicontext.get(baseUrl + "GetCertifieldUser");
    }

    function addPtoDetails(details) {
      var _entity = _attachLocationCoordinates(details);
      return apicontext.post(baseUrl + "AddPtoDetails", _entity);
    }

    function getSummaryPayableHours(filters) {
      return apicontext.post(baseUrl + "GetPayableHoursSummaryView", filters);
    }

    function clearClockOutTime(detailId, fromDeleteClockIn) {
      return apicontext.get(baseUrl + "ClearClockOutTime?detailNum=" + detailId + "&fromDeleteClockIn=" + fromDeleteClockIn);
    }

    function clearTimecardFactoryData() {
      factory.data = {
        details: [],
        jobCodes: {
          CLOCK_IN: 5001,
          CLOCK_OUT: 5002
        },
        summary: null
      };
    }
    var data = {
      details: [],
      jobCodes: {
        CLOCK_IN: 5001,
        CLOCK_OUT: 5002
      },
      summary: null
    };


    function checkoutPending(details) {
      var defer = $q.defer();
      var _e = details;
      var tcd = kendo.parseDate(details.timeCardDate);
      var _ft = moment(new Date(tcd.getFullYear(), tcd.getMonth(), tcd.getDate(), new Date().getHours(), new Date().getMinutes(), 0, 0));
      var _st = kendo.parseDate(_e.startTime);
      if (_ft.isBefore(_st)) {
        defer.resolve({
          success: false,
          reason: -1
        });
      } else {
        _e.finishTime = kendo.toString(new Date(tcd.getFullYear(), tcd.getMonth(), tcd.getDate(), new Date().getHours(), new Date().getMinutes(), 0, 0), "g");
        addNewDetails(_e).then(function (response) {
          if (response) {
            defer.resolve({
              success: true,
              reason: 0
            });
          }
        });
      }
      return defer.promise;
    }

    function checkPreviousDateClockIn(model) {
      return apicontext.post(baseUrl + "CheckPreviousDateClockIn", model);
    }

    var statusTypes = {
      NONE: 0,
      SEND_FOR_APPROVAL: 1,
      CANCELLED: 2,
      APPROVED: 3,
      UNAPPROVED: 4,
      RESENT_FOR_APPROVAL: 5
    };

    var factory = {};
    factory.statics = {
      jobCodes: jobCodes,
      statusTypes: statusTypes
    };
    factory.checkPreviousDateClockIn = checkPreviousDateClockIn;
    factory.clearClockOutTime = clearClockOutTime;
    factory.checkoutPending = checkoutPending;
    factory.clearTimecardFactoryData = clearTimecardFactoryData;
    factory.addPtoDetails = addPtoDetails;
    factory.getSummaryPayableHours = getSummaryPayableHours;
    factory.certifyUser = certifyUser;
    factory.getCertifieldUser = getCertifieldUser;
    factory.pushCheckInOutTimes = pushCheckInOutTimes;
    factory.data = data;
    factory.getPendingClockIns = getPendingClockIns;
    factory.getJobCodes = getJobCodes;

    factory.clockInOutUser = clockInOutUser;
    factory.getClockInByDate = getClockInByDate;
    factory.getTimeCardByDate = getTimeCardByDate;
    factory.getWorkOrdersList = getWorkOrdersList;
    factory.addNewDetails = addNewDetails;
    factory.clearCheckedOutTime = clearCheckedOutTime;
    factory.sendForApproval = sendForApproval;
    factory.deleteTimeCardDetails = deleteTimeCardDetails;
    factory.clearTimeCard = clearTimeCard;
    return factory;
  }

  initFactory.$inject = ["api-base-factory", "$rootScope", "$q", "$cacheFactory"];
  angular.module("fpm").factory("timecard-factory", initFactory);
})();
