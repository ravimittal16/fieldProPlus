(function () {
  "use strict";

  function initFactory($timeout, $cordovaSQLite, $q, authenticationFactory) {
    var db = null;
    var FP_DB_NAME = "fieldPromaxDb";
    var IS_CONNECTED = true;
    var _isOnDevMode = false;

    function setDb(_db, isOnDevMode) {
      _isOnDevMode = isOnDevMode;
      db = _db;
    }

    function insertUserLoginInfo(userName, password, jsonPayload) {
      var selectQuery = "SELECT * FROM UserLogins WHERE userName = ?";
      var insertQuery = "INSERT INTO UserLogins (userName, passwordPlain,jsonPayload) VALUES (?,?,?)";
      /**
       * checking whether user is already exists
       */
      _executeQueryWithParams(selectQuery, [userName], function (_res) {
        if (_res.rows.length !== 0) {

          // deleting the previous entry if already exists because we need to save the latest user settings everytime.

          _executeQueryWithParams("DELETE FROM UserLogins WHERE userName = ?", [userName], function (res) {

            // inseting the latest records for the user

            _executeQueryWithParams(insertQuery, [userName, password, jsonPayload], function (res) {}, _errorCallback);
          }, function (error) {});
        } else {
          _executeQueryWithParams(insertQuery, [userName, password, jsonPayload], function (res) {}, function (error) {});
        }
      }, _errorCallback);
    }

    function insertWorkOrderRef(model) {
      var defer = $q.defer();
      /**
       * check to verify if user already clicked on offline button, if the barcode and schedule is already there
       * we don't need to re-insert.
       */
      var selectQuery = "SELECT * FROM UserWorkOrders WHERE barcode = ? AND scheduleNum = ?";
      _executeQueryWithParams(selectQuery, [model.barcode, model.scheduleNum], function (_res) {
        if (_res.rows.length === 0) {
          var query = "INSERT INTO UserWorkOrders (barcode, userName,scheduleNum,jsonPayload, isSynced) VALUES (?,?,?,?,?)";
          _executeQueryWithParams(query, [model.barcode, model.userName, model.scheduleNum, model.jsonPayload, 0], function (res) {
            defer.resolve(res.insertId);
          }, function (error) {
            defer.resolve(0);
          });
        } else {
          /**
           * 
           *  -1, will indicate the barcode & scheduleId, has already exists in table
           */
          defer.resolve(-1);
        }
      });
      return defer.promise;
    }


    function _executeQueryWithParams(query, paramsArray, successCallback, errorCallback) {
      if (db) {
        if (paramsArray) {
          $cordovaSQLite.execute(db, query, paramsArray).then(successCallback, errorCallback);
        } else {
          _executeQuery(query, successCallback, errorCallback);
        }
      }
    }

    function _executeQuery(queryString, successCallback, errorCallback) {
      try {
        if (db) {
          $cordovaSQLite.execute(db, queryString).then(
            function (res) {
              successCallback(res);
            },
            errorCallback);
        }
      } catch (error) {

      }
    }

    function _errorCallback(error) {
      window.alert(error);
    }

    function createUserLoginTable() {
      _execute("CREATE TABLE IF NOT EXISTS UserLogins (id INTEGER PRIMARY KEY AUTOINCREMENT, userName TEXT, passwordPlain TEXT, jsonPayload TEXT)").then(
        function (response) {},
        _errorCallback);
    }

    function createWorkOrdersTable() {
      var queries = ["CREATE TABLE IF NOT EXISTS UserWorkOrders (id INTEGER PRIMARY KEY AUTOINCREMENT, barcode TEXT, userName TEXT,scheduleNum INTEGER,jsonPayload TEXT, isSynced NUMERIC)",
        "CREATE TABLE IF NOT EXISTS WorkOrderPrimary (id INTEGER PRIMARY KEY AUTOINCREMENT, barcode TEXT, userName TEXT,scheduleNum INTEGER,workDescription TEXT,resolution TEXT,jsonPayload TEXT, isSynced NUMERIC)",
        "CREATE TABLE IF NOT EXISTS WorkOrderSchedule (id INTEGER PRIMARY KEY AUTOINCREMENT, barcode TEXT,scheduleNum INTEGER,actualFinishDateTime TEXT,actualStartDateTime TEXT,scheduledFinishDateTime TEXT,scheduledStartDateTime TEXT,workComplete INTEGER,jsonPayload TEXT,updatedOn TEXT,isSynced NUMERIC)",
        "CREATE TABLE IF NOT EXISTS WorkOrderProducts (id INTEGER PRIMARY KEY AUTOINCREMENT, barcode TEXT,productNum INTEGER,productName TEXT,productDescription TEXT,price REAL,qty REAL,jsonPayload TEXT, isSynced NUMERIC)"
      ]
      for (var i = 0; i < queries.length; i++) {
        _execute(queries[i]);
      }
    }

    function _insertProductsRefs(workOrderInfo) {
      _execute("SELECT * FROM sqlite_master WHERE name = 'WorkOrderProducts' and type='table'", null).then(function (response) {
        if (response.rows.length > 0) {
          var _products = workOrderInfo.products;
          var checkQuery = "SELECT * FROM WorkOrderProducts WHERE barcode = ?"
          _execute(checkQuery, [_products[0].barcode]).then(function (response) {
            if (response.rows.length === 0) {
              for (var i = 0; i < _products.length; i++) {
                var _pro = _products[i];
                if (_pro) {
                  _execute("INSERT INTO WorkOrderProducts (barcode,productNum,productName,productDescription,price,qty,jsonPayload,isSynced) VALUES (?,?,?,?,?,?,?,?)",
                    [_pro.barcode, _pro.num, _pro.productName, _pro.productDescription, _pro.price, _pro.qty, JSON.stringify(_pro), 0]);
                }
              }
            }
          });
        }
      });
    }
    /**
     * this function will insert the products and schedule information to local database
     */
    function _insertScheduleAndProducts(workOrderInfo, scheduleNum) {
      _execute("SELECT * FROM sqlite_master WHERE name ='WorkOrderSchedule' and type='table'", null).then(function (response) {
        if (response.rows.length > 0) {
          var _sch = _.findWhere(workOrderInfo.schedules, {
            num: scheduleNum
          });
          if (_sch) {
            _execute("INSERT INTO WorkOrderSchedule (barcode,scheduleNum,actualFinishDateTime,actualStartDateTime,scheduledFinishDateTime,scheduledStartDateTime,workComplete,jsonPayload,isSynced) VALUES (?,?,?,?,?,?,?,?,?)",
              [_sch.barcode, scheduleNum, _sch.actualFinishDateTime, _sch.actualStartDateTime, _sch.scheduledFinishDateTime, _sch.scheduledStartDateTime, _sch.workComplete ? 1 : 0, JSON.stringify(_sch), 0]).then(function (_r) {
              if (_r) {
                _insertProductsRefs(workOrderInfo);
              }
            });
          }
        }
      });
    }
    /** this function will insert all the information about the work order | schedule | products 
     * into relevant tables
     * ? each insert will first check the record existance
     * */

    function insertWorkOrderInfo(workOrderInfo, scheduleNum) {
      _execute("SELECT * FROM sqlite_master WHERE name ='WorkOrderPrimary' and type='table'", null).then(function (response) {
        if (response.rows.length > 0) {
          var _wo = workOrderInfo.barcodeDetails;
          _execute("INSERT INTO WorkOrderPrimary (barcode,scheduleNum,workDescription,resolution,jsonPayload,isSynced) VALUES (?,?,?,?,?,?)",
            [_wo.barcode, scheduleNum, _wo.comment_1, _wo.comment_2, JSON.stringify(_wo), 0]).then(function (_r) {
            if (_r) {
              _insertScheduleAndProducts(workOrderInfo, scheduleNum);
            }
          });
        }
      });
    }

    /**
     * 
     * @param query 
     * @param params 
     * @returns promise
     */
    function _execute(query, params) {
      if (params) {
        return $cordovaSQLite.execute(db, query, params);
      } else {
        return $cordovaSQLite.execute(db, query);
      }
    }

    /** this will return all the same orders by the user from local database*/
    function getSavedOrdersByUser(userEmail) {
      var selectQuery = "SELECT * FROM UserWorkOrders WHERE userName = ?";
      return _execute(selectQuery, [userEmail]).then(function (res) {
        return res.rows;
      });
    }

    function deleteProducts(barcode) {
      var selectOrder = "SELECT * FROM WorkOrderPrimary WHERE barcode = ?";
      _execute(selectOrder, [barcode]).then(function (response) {
        if (response.rows.length === 0) {
          var query = "DELETE FROM WorkOrderProducts WHERE barcode = ?"
          _execute(query, [barcode]);
        }
      })
    }

    /** this will delete saved order from local database*/
    function deleteOrder(barcode, scheduleNum) {
      var deleteQueriesTables = ["UserWorkOrders", "WorkOrderPrimary", "WorkOrderSchedule"];
      for (var i = 0; i < deleteQueriesTables.length; i++) {
        var query = "DELETE FROM " + deleteQueriesTables[i] + " WHERE barcode = ? AND scheduleNum = ?"
        /**
         * we don't need to return before delete operation of each table is executed
         */
        if (i === deleteQueriesTables.length - 1) {
          return _execute(query, [barcode, scheduleNum]).then(function () {
            deleteProducts(barcode);
          });
        } else {
          _execute(query, [barcode, scheduleNum]);
        }
      }
    }

    /** this will delete saved order from local database*/
    function _executeSelect(selectQuery, params) {
      return _execute(selectQuery, params).then(function (response) {
        return _isOnDevMode ? response : response.rows;
      }, _errorCallback);
    }

    function _workOrderInformation(barcode, scheduleNum) {
      var selectQuery = "SELECT * FROM UserWorkOrders WHERE barcode = ? AND scheduleNum = ?";
      return _executeSelect(selectQuery, [barcode, scheduleNum]);
    }

    function _workOrderInformationAll(barcode, scheduleNum) {
      var selectQuery = "SELECT * FROM WorkOrderPrimary WHERE barcode = ? AND scheduleNum = ?";
      return _executeSelect(selectQuery, [barcode, scheduleNum]);
    }

    function _workOrderScheduleInformation(barcode, scheduleNum) {
      var selectQuery = "SELECT * FROM WorkOrderSchedule WHERE barcode = ? AND scheduleNum = ?";
      return _executeSelect(selectQuery, [barcode, scheduleNum]);
    }

    function _workOrderProductsInformation(barcode) {
      var selectQuery = "SELECT * FROM WorkOrderProducts WHERE barcode = ?";
      return _executeSelect(selectQuery, [barcode])
    }

    function getOrderInfo(barcode, scheduleNum) {
      var defer = $q.defer();
      var result = {};

      /** to get all data from various offline tables */

      $q.all([_workOrderInformation(barcode, scheduleNum),
        _workOrderInformationAll(barcode, scheduleNum),
        _workOrderScheduleInformation(barcode, scheduleNum),
        _workOrderProductsInformation(barcode)
      ]).then(function (res) {

        /** result set object names, {res} containes all results as array of objects */

        var resultNames = ["barcodeInfo", "workOrderDetails", "schedule", "products"];


        if (_isOnDevMode) {
          if (res && res.length > 0) {
            for (var i = 0; i < 3; i++) {
              if (res[i].rows.length > 0) {
                result[resultNames[i]] = res[i].rows["0"];
              }
            }
            /** since products going to be an array, it handled here */
            if (res.length === resultNames.length) {
              var products = [];
              var _p_r_i = 3;
              for (var i = 0; i < res[_p_r_i].rows.length; i++) {
                products.push(res[_p_r_i].rows[i]);
              }
              result[resultNames[_p_r_i]] = products;
            }
          }
        } else {
          if (res && res.length > 0) {
            for (var i = 0; i < 3; i++) {
              if (res[i].length > 0) {
                result[resultNames[i]] = res[i].item(0);
              }
            }
            if (res.length === resultNames.length) {
              var products = [];
              var _p_r_i = 3;
              for (var i = 0; i < res[_p_r_i].length; i++) {
                products.push(res[_p_r_i].item(i));
              }
              result[resultNames[_p_r_i]] = products;
            }
          }
        }
        $timeout(function () {
          defer.resolve(result);
        }, 200)
      });
      return defer.promise;
    }

    function updateScheduleInformation(propertyName, propertyValue, num) {
      var updateScheduleQuery = "UPDATE WorkOrderSchedule SET " + propertyName + " = ? WHERE scheduleNum = ?";
      return _execute(updateScheduleQuery, [propertyValue, num]);
    }

    function updateWorkOrder(propertyName, propertyValue, barcode) {
      var updateScheduleQuery = "UPDATE WorkOrderPrimary SET " + propertyName + " = ? WHERE barcode = ?";
      return _execute(updateScheduleQuery, [propertyValue, barcode]);
    }


    function updateProduct(propertyName, propertyValue, num) {}


    function tryLoginOffline(userName, password) {}

    function setNetworkConnectivity(_isConnected) {
      IS_CONNECTED = _isConnected;
    }

    return {
      FP_DB_NAME: FP_DB_NAME,
      isConnected: IS_CONNECTED,
      setNetworkConnectivity: setNetworkConnectivity,
      tryLoginOffline: tryLoginOffline,
      setDb: setDb,
      deleteOrder: deleteOrder,
      getOrderInfo: getOrderInfo,
      insertWorkOrderInfo: insertWorkOrderInfo,
      getSavedOrdersByUser: getSavedOrdersByUser,
      createUserLoginTable: createUserLoginTable,
      createWorkOrdersTable: createWorkOrdersTable,
      insertWorkOrderRef: insertWorkOrderRef,
      insertUserLoginInfo: insertUserLoginInfo,
      updateScheduleInformation: updateScheduleInformation,
      updateWorkOrder: updateWorkOrder,
      updateProduct: updateProduct
    };
  }


  initFactory.$inject = ["$timeout", "$cordovaSQLite", "$q", "authenticationFactory"];

  angular.module("fpm").factory("sqlStorageFactory", initFactory);
})();
