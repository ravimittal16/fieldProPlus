(function() {
  function initFactory($rootScope, fieldPromaxConfig, authenticationFactory) {
    var proxy = null;
    var connection = $.hubConnection(
      fieldPromaxConfig.fieldPromaxApi + "signalr/hubs"
    );
    function startConnection() {
      connection.qs = {
        Bearer: authenticationFactory.getToken()
      };

      connection.start().done(function() {});
    }

    function getProxy() {
      proxy = connection.createHubProxy("workOrderHubContext");
    }

    function onScheduleMarkCompleted(scheduleNum, barcode, customerNumber) {
      if (proxy === null) getProxy();
      proxy.invoke(
        "onScheduleMarkCompleted",
        scheduleNum,
        barcode,
        customerNumber
      );
    }
    return {
      getProxy: getProxy,
      startConnection: startConnection,
      onScheduleMarkCompleted: onScheduleMarkCompleted
    };
  }
  angular
    .module("fpm.realtime")
    .factory("fpm.realtime.workorders.factory", [
      "$rootScope",
      "fieldPromaxConfig",
      "authenticationFactory",
      initFactory
    ]);
})();
