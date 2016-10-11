"use strict";
///<reference path="../../typings/index.d.ts" />
var reqwest = require("reqwest");
var extend = require('extend');
/**
 * Wrapper to create a consistent sdk for doing XHR requests. Will
 * automatically replace matching variables in urls that match the pattern.
 * i.e/ /my/url/{someId}/ { someId: 1 } = /my/url/1/
 */
var ApiServiceClass = (function () {
    function ApiServiceClass() {
    }
    ApiServiceClass.prototype.throttle = function (func, wait, immediate) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate)
                    func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow)
                func.apply(context, args);
        };
    };
    ApiServiceClass.prototype.get = function (url, data, config) {
        if (config === void 0) { config = null; }
        return reqwest(this._buildConfig({
            url: this._buildUrl(url, data),
            method: 'get'
        }, config));
    };
    ApiServiceClass.prototype.post = function (url, data, config) {
        if (config === void 0) { config = null; }
        return reqwest(this._buildConfig({
            url: this._buildUrl(url, data, false),
            method: 'post',
            data: JSON.stringify(data),
            contentType: 'application/json'
        }, config));
    };
    ApiServiceClass.prototype.put = function (url, data, config) {
        if (config === void 0) { config = null; }
        return reqwest(this._buildConfig({
            url: this._buildUrl(url, data, false),
            method: 'put',
            data: JSON.stringify(data),
            contentType: 'application/json'
        }, config));
    };
    ApiServiceClass.prototype['delete'] = function (url, data, config) {
        if (config === void 0) { config = null; }
        return reqwest(this._buildConfig({
            url: this._buildUrl(url, data),
            method: 'delete'
        }, config));
    };
    ApiServiceClass.prototype._buildUrl = function (url, data, queryString) {
        if (queryString === void 0) { queryString = true; }
        //build the url
        for (var i in data) {
            if (url.indexOf('{' + i + '}') !== -1) {
                url = url.replace('{' + i + '}', data[i]);
                continue;
            }
            if (queryString === false) {
                continue;
            }
            if (url.indexOf('?') !== -1) {
                url += '&';
            }
            else {
                url += '?';
            }
            url += i + '=' + data[i];
        }
        return url;
    };
    ApiServiceClass.prototype._buildConfig = function (defaultConfig, customConfig) {
        if (customConfig === void 0) { customConfig = {}; }
        if (customConfig === null) {
            return defaultConfig;
        }
        return extend(true, {}, defaultConfig, customConfig);
    };
    return ApiServiceClass;
}());
exports.ApiServiceClass = ApiServiceClass;
var ApiService = new ApiServiceClass();
exports.ApiService = ApiService;
