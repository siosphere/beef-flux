"use strict";
/**
 * Holds routes (an object with 'url/pattern': function())
 */
var RoutingConfig = (function () {
    function RoutingConfig(routes) {
        this.routes = routes;
    }
    RoutingConfig.prototype.isRoute = function (url) {
        return typeof this.routes[url] !== 'undefined';
    };
    RoutingConfig.prototype.callRoute = function (url, data) {
        return this.routes[url](data);
    };
    RoutingConfig.prototype.handleRequest = function (url, request, response, data) {
        return this.routes[url](request, response, data);
    };
    return RoutingConfig;
}());
exports.RoutingConfig = RoutingConfig;
