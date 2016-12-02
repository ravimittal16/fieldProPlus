(function () {
    "use strict";

    function initFactory(apiContext) {

        var apibase = "api/expense/";

        function getExpense(barcode, isFromMain) {
            return apiContext.get(apibase + "GetExpense?barcode=" + barcode + "&isFromMain=" + isFromMain);
        }

        function addExpense(expense) {
            return apiContext.post(apibase + "AddExpense", expense);
        }

        function deleteExpense(id) {
            return apiContext.deleteReq(apibase + "DeleteExpense?id=" + id);
        }

        function markAsPaidUnPaid(id) {
            return apiContext.get(apibase + "MarkAsPaidUnPaid?id=" + id);
        }

        function deleteImage(id) {
            return apiContext.deleteReq(apibase + "DeleteImage?expenseId=" + id);
        }

        var factory = {};
        factory.markAsPaidUnPaid = markAsPaidUnPaid;
        factory.deleteExpense = deleteExpense;
        factory.addExpense = addExpense;
        factory.getExpense = getExpense;
        factory.deleteImage = deleteImage;
        return factory;
    }

    initFactory.$inject = ["api-base-factory"];
    angular.module("fpm").factory("expense-data-factory", initFactory);
})();