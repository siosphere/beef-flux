"use strict";
///<reference path="../../typings/tsd.d.ts" />
var $ = require("jquery");
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
    ApiServiceClass.prototype.get = function (url, data) {
        return $.ajax({
            url: this._buildUrl(url, data),
            data: JSON.stringify(data),
            method: "GET",
            dataType: 'json'
        });
    };
    ApiServiceClass.prototype.post = function (url, data) {
        return $.ajax({
            url: this._buildUrl(url, data, false),
            data: JSON.stringify(data),
            method: "POST",
            dataType: 'json'
        });
    };
    ApiServiceClass.prototype.put = function (url, data) {
        return $.ajax({
            url: this._buildUrl(url, data, false),
            data: JSON.stringify(data),
            method: "PUT",
            dataType: 'json'
        });
    };
    ApiServiceClass.prototype['delete'] = function (url, data) {
        return $.ajax({
            url: this._buildUrl(url, data),
            data: JSON.stringify(data),
            method: "DELETE",
            dataType: 'json'
        });
    };
    ApiServiceClass.prototype._buildUrl = function (url, data, queryString) {
        if (queryString === void 0) { queryString = true; }
        //build the url
        for (var i in data) {
            //check if URL requires data, and if provided, replace in URL.
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
    return ApiServiceClass;
}());
var ApiService = new ApiServiceClass();
exports.ApiService = ApiService;
