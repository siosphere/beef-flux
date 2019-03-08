"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var extend = require("extend");
/**
 * Wrapper to create a consistent sdk for doing XHR requests. Will
 * automatically replace matching variables in urls that match the pattern.
 * i.e/ /my/url/{someId}/ { someId: 1 } = /my/url/1/
 */
var ApiServiceClass = /** @class */ (function () {
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
        var params = this._buildConfig({
            method: "GET",
            mode: "no-cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json"
            },
            redirect: "follow",
            referrer: "no-referrer"
        }, config);
        return fetch(this._buildUrl(url, data), params);
    };
    ApiServiceClass.prototype.post = function (url, data, config) {
        if (config === void 0) { config = null; }
        var params = this._buildConfig({
            method: "POST",
            mode: "no-cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json; charset=utf-8"
            },
            redirect: "follow",
            referrer: "no-referrer",
            body: JSON.stringify(data)
        }, config);
        return fetch(this._buildUrl(url, data, false), params);
    };
    ApiServiceClass.prototype.put = function (url, data, config) {
        if (config === void 0) { config = null; }
        var params = this._buildConfig({
            method: "PUT",
            mode: "no-cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json; charset=utf-8"
            },
            redirect: "follow",
            referrer: "no-referrer",
            body: JSON.stringify(data)
        }, config);
        return fetch(this._buildUrl(url, data, false), params);
    };
    ApiServiceClass.prototype['delete'] = function (url, data, config) {
        if (config === void 0) { config = null; }
        var params = this._buildConfig({
            method: "DELETE",
            mode: "no-cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json"
            },
            redirect: "follow",
            referrer: "no-referrer"
        }, config);
        return fetch(this._buildUrl(url, data), params);
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
