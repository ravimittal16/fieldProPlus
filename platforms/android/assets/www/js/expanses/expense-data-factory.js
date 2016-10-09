(function () {
    "use strict";

    function initFactory(apiContext) {
        var factory = {};
        var apibase = "api/expense/";

        factory.schema = { expenseId: 0, Title: "", Description: "", ExpenseType: 0, ExpenseStatus: 0, TotalCost: 0, Barcode: "", ExpenseDate: new Date(), Quantity: 1, ImageChanged: false, havingImage: false };


        function getExpense(barcode, isFromMain) {
            return apiContext.get(apibase + "GetExpense?barcode=" + barcode + "&isFromMain=" + isFromMain);
        }

        function addExpense(expense) {
            return apiContext.post(apibase + "AddExpense", expense);
        }

        function deleteExpense(id) {
            return apiContext.deleteApiCall(apibase + "DeleteExpense?id=" + id);
        }

        function markAsPaidUnPaid(id) {
            return apiContext.get(apibase + "MarkAsPaidUnPaid?id=" + id);
        }

        function deleteImage(id) {
            return apiContext.deleteApiCall(apibase + "DeleteImage?expenseId=" + id);
        }

        factory.markAsPaidUnPaid = markAsPaidUnPaid;
        factory.deleteExpense = deleteExpense;
        factory.addExpense = addExpense;
        factory.getExpense = getExpense;
        // factory.openModal = openModal;
        factory.deleteImage = deleteImage;
        return factory;
    }

    initFactory.$inject = ["api-base-factory"];
    angular.module("fpm").factory("expense-data-factory", initFactory);
})();