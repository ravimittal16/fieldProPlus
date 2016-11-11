(function () {
    "use strict";

    function initFactory(apicontext, $q, $cacheFactory) {
        var baseUrl = "api/timecard/";
        var cache = $cacheFactory("timeCardCache");
        function getTimeCardByDate(date) {
            console.log(date);
            return apicontext.get(baseUrl + "GetTimeCardByDate?date=" + date);
        }

        function getClockInByDate(date) {
            return apicontext.get(baseUrl + "GetClockInByDate?date=" + date);
        }

        function clockInOutUser(details) {
            return apicontext.post(baseUrl + "ClockInOutUser", details);
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
            return apicontext.post(baseUrl + "AddNewDetails", entity);
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
            return apicontext.post(baseUrl + "PushCheckInOutTimes", entity);
        }

        function certifyUser() {
            return apicontext.get(baseUrl + "CertifieldUser");
        }

        function getCertifieldUser() {
            return apicontext.get(baseUrl + "GetCertifieldUser");
        }

        function addPtoDetails(details) {
            return apicontext.post(baseUrl + "AddPtoDetails", details);
        }

        var data = { details: [], jobCodes: { CLOCK_IN: 5001, CLOCK_OUT: 5002 } };
        var factory = {};
        factory.addPtoDetails = addPtoDetails;
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

    initFactory.$inject = ["api-base-factory", "$q", "$cacheFactory"];
    angular.module("fpm").factory("timecard-factory", initFactory);
})();