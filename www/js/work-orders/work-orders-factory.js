(function() {
    "use strict";

    function initFactory($q, $cacheFactory, apiBaseFactory, sharedDataFactory) {
        var apibaseurl = "api/workorders/"
        var cache = $cacheFactory("orderCache");
        var dashboardDataKeyName = "dashboardData";

        function getMobileDashboard(forceGet, initialData) {
            forceGet = forceGet === null ? false : forceGet;
            if (forceGet === true) {
                cache.remove(dashboardDataKeyName);
            }
            var orders = cache.get(dashboardDataKeyName);
            if (angular.isDefined(orders) && orders) {
                return $q.when(orders);
            } else {
                return apiBaseFactory.get(apibaseurl + "GetMobileDashboard").then(function(response) {
                    cache.put(dashboardDataKeyName, response);
                    return response;
                });
            }
        }

        function getBarcodeDetails(barcode) {
            return apiBaseFactory.get(apibaseurl + "GetBarcodeDetails?barcode=" + barcode);
        }

        function deleteProduct(barcode, num) {
            return apiBaseFactory.get(apibaseurl + "DeleteProduct?barcode=" + barcode + "&productNum=" + num);
        }

        function updateProduct(model) {
            return apiBaseFactory.post(apibaseurl + "UpdateProduct?fromMobile=true", model);
        }

        function searchProduct(searchValue, alphabet) {
            return apiBaseFactory.get(apibaseurl + "GetProductsLists?searchPattern=" + searchValue + "&alphabet=" + alphabet);
        }

        function addProduct(model) {
            return apiBaseFactory.post(apibaseurl + "AddProductsToOrder?fromMobile=true", model);
        }

        function getBarcodeInvoiceAndProductDetails(barcode) {
            return apiBaseFactory.get(apibaseurl + "GetBarcodeInvoiceAndProductDetails?barcode=" + barcode);
        }

        function saveJsonSignForBarcode(obj) {
            return apiBaseFactory.post(apibaseurl + "SaveJsonSignForBarcode", obj);
        }

        function sendInvoiceMail(model) {
            return apiBaseFactory.post(apibaseurl + "SendInvoiceMail", model);
        }

        function getImagesList(barcode) {
            return apiBaseFactory.get(apibaseurl + "GetImagesList?barcode=" + barcode);
        }

        function getUploadedDocuments(barcode) {
            return apiBaseFactory.get(apibaseurl + "GetUploadedDocuments?barcode=" + barcode);
        }

        function uploadFile(model) {
            return apiBaseFactory.post(apibaseurl + "UploadFile", model);
        }

        function createEntity() {
            var entity = cache.get("workOrderEntity");
            if (angular.isDefined(entity) && entity) {
                return $q.when(entity);
            } else {
                return apiBaseFactory.get(apibaseurl + "CreateEntity").then(function(response) {
                    cache.put("workOrderEntity", response);
                    return response;
                });
            }
        }

        function createWorkOrder(model) {
            return apiBaseFactory.post(apibaseurl + "CreateWorkOrder", model);
        }

        function getBarCodeNumber() {
            return apiBaseFactory.get(apibaseurl + "GetBarCodeNumber");
        }

        function updateWorkOrderMobile(model) {
            return apiBaseFactory.post(apibaseurl + "UpdateWorkOrderMobile", model);
        }

        function updateJobStatus(sch) {
            sch.clientTime = new Date();
            return apiBaseFactory.post(apibaseurl + "UpdateJobStatus", sch);
        }

        function updateSchedule(schedule) {
            return apiBaseFactory.post(apibaseurl + "UpdateSchedule?fromMobile=true", schedule);
        }

        function addWorkOrderSchedule(schedule) {
            return apiBaseFactory.post(apibaseurl + "AddWorkOrderSchedule", schedule);
        }

        function updateOrderProduct(product) {
            return apiBaseFactory.post(apibaseurl + "UpdateOrderProduct", product);
        }
        var workOrderCalendarKeyName = "workorder:calendar";
        function getDatewiseEvents(forceGet) {
            forceGet = forceGet === null ? false : forceGet;
            if (forceGet === true) {
                cache.remove(workOrderCalendarKeyName);
            }
            var calenderSchedules = cache.get(workOrderCalendarKeyName);
            if (angular.isDefined(calenderSchedules) && calenderSchedules) {
                return $q.when(calenderSchedules);
            } else {
                return apiBaseFactory.get("api/Scheduler/GetMyCalender?fromMobile=true").then(function(response) {
                    cache.put(workOrderCalendarKeyName, response);
                    return response;
                });
            }
        }

        return {
            getMobileDashboard: getMobileDashboard,
            getBarcodeDetails: getBarcodeDetails,
            deleteProduct: deleteProduct,
            updateProduct: updateProduct,
            searchProduct: searchProduct,
            addProduct: addProduct,
            getBarcodeInvoiceAndProductDetails: getBarcodeInvoiceAndProductDetails,
            saveJsonSignForBarcode: saveJsonSignForBarcode,
            sendInvoiceMail: sendInvoiceMail,
            getImagesList: getImagesList,
            getUploadedDocuments: getUploadedDocuments,
            uploadFile: uploadFile,
            createEntity: createEntity,
            createWorkOrder: createWorkOrder,
            getBarCodeNumber: getBarCodeNumber,
            updateWorkOrderMobile: updateWorkOrderMobile,
            updateJobStatus: updateJobStatus,
            updateSchedule: updateSchedule,
            addWorkOrderSchedule: addWorkOrderSchedule,
            updateOrderProduct: updateOrderProduct,
            getDatewiseEvents: getDatewiseEvents
        };
    }
    initFactory.$inject = ["$q", "$cacheFactory", "api-base-factory", "shared-data-factory"];
    angular.module("fpm").factory("work-orders-factory", initFactory);
})();
