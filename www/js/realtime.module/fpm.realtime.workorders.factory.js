(function() {
  function initFactory($rootScope, fieldPromaxConfig) {
    console.log("");
    var connection = $.hubConnection(
      fieldPromaxConfig.fieldPromaxApi + "signalr/hubs"
    );
    var proxy = connection.createHubProxy("workOrderHubContext");
    connection.start().done(function() {
      console.log("STARTS");
    });
    function onScheduleMarkCompleted(scheduleNum, barcode, customerNumber) {
      proxy.invoke(
        "onScheduleMarkCompleted",
        scheduleNum,
        barcode,
        customerNumber
      );
    }
    return {
      onScheduleMarkCompleted: onScheduleMarkCompleted
    };
  }
  angular
    .module("fpm.realtime")
    .factory("fpm.realtime.workorders.factory", [
      "$rootScope",
      "fieldPromaxConfig",
      initFactory
    ]);
})();
