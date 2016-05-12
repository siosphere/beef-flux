"use strict";
var actions_1 = require("../actions/actions");
var api_service_1 = require("../api/api-service");
var routing_service_1 = require("../routing/routing-service");
var store_1 = require("../store/store");
/**
 * Handles our services, our initial setup of services, and starts the
 * framework
 */
var Beef = (function () {
    function Beef() {
    }
    Beef.started = false;
    Beef.store = null;
    Beef.Actions = function () {
        return {
            create: function (params) {
                return actions_1.Actions.create(params);
            }
        };
    };
    Beef.Api = function () {
        return api_service_1.ApiService;
    };
    Beef.Store = function () {
        return store_1.Store;
    };
    Beef.Router = function () {
        return routing_service_1.RoutingService;
    };
    return Beef;
}());
window['Beef'] = Beef;
