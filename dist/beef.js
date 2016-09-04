(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.beef = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var action_1 = require("./component/action");
/**
 * Used to create actions that can be dispatched to stores.
 *
 * Usage:
 *
 * class TodoActionsClass extends Action {
 *
 *   receiveTodos(todos : any[])
 *   {
 *       return todos;
 *   }
 * };
 *
 * var TodoActions : TodoActionsClass = Actions.create(new TodoActionsClass());
 *
 *
 * Listening on a store:
 *
 * TodoActions._register({
 *     receiveTodos: TodoActions.receiveTodos
 * }, this);
 *
 * Each action should return the value that will be sent to the callbacks
 * listening on this action
 */
var Actions = (function () {
    function Actions() {
    }
    /**
     * Create the action
     */
    Actions.create = function (params) {
        var action = new action_1.Action();
        for (var key in params) {
            if (key[0] === '_' || Actions.ignoreFunctions.indexOf(key) >= 0) {
                continue;
            }
            action[key] = new function () {
                return (new Function("return function (fn) { return function " + key +
                    " () { return fn(this, arguments) }; };")())(Function.apply.bind(function (key) {
                    var args = [];
                    for (var i in arguments) {
                        if (i === "0") {
                            continue;
                        }
                        args.push(arguments[i]);
                    }
                    action._dispatch(key, params[key].bind(action), args);
                }.bind(null, key)));
            };
        }
        return action;
    };
    Actions.ignoreFunctions = ['constructor'];
    return Actions;
}());
exports.Actions = Actions;
;

},{"./component/action":2}],2:[function(require,module,exports){
"use strict";
/**
 * An action will store callbacks that apply to actionTypes it can dispatch,
 */
var Action = (function () {
    function Action() {
        this._callbacks = {};
    }
    /**
     * Register functions to actions we may contain,
     * Params should be an object where the "key" is the function that should
     * be called on "scope" when the params[key] action takes place
     */
    Action.prototype._register = function (params, scope) {
        for (var key in params) {
            var actionName = params[key].name;
            if (typeof this._callbacks[actionName] === 'undefined') {
                this._callbacks[actionName] = [];
            }
            this._callbacks[actionName].push(scope[key].bind(scope));
        }
    };
    /**
     * Internal function used to dispatch a message when an action is called
     */
    Action.prototype._dispatch = function (actionName, fn, args) {
        if (typeof this._callbacks[actionName] === 'undefined') {
            return;
        }
        var data = fn.apply(this, args);
        this._callbacks[actionName].forEach(function (callback) {
            callback(data);
        });
    };
    return Action;
}());
exports.Action = Action;

},{}],3:[function(require,module,exports){
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

},{"extend":11,"reqwest":12}],4:[function(require,module,exports){
"use strict";
var api_service_1 = require("../api/api-service");
var actions_1 = require("../actions/actions");
var action_1 = require("../actions/component/action");
var config_1 = require("../routing/component/config");
var route_decorator_1 = require("../routing/decorators/route-decorator");
var routing_service_1 = require("../routing/routing-service");
var store_1 = require("../store/store");
var store_decorator_1 = require("../store/store-decorator");
module.exports = {
    ApiService: api_service_1.ApiService,
    ApiServiceClass: api_service_1.ApiServiceClass,
    Actions: actions_1.Actions,
    Action: action_1.Action,
    RoutingConfig: config_1.RoutingConfig,
    sanitize: route_decorator_1.sanitize,
    RoutingService: routing_service_1.RoutingService,
    RoutingServiceClass: routing_service_1.RoutingServiceClass,
    Store: store_1.Store,
    Schema: store_decorator_1.Schema
};

},{"../actions/actions":1,"../actions/component/action":2,"../api/api-service":3,"../routing/component/config":5,"../routing/decorators/route-decorator":6,"../routing/routing-service":7,"../store/store":9,"../store/store-decorator":8}],5:[function(require,module,exports){
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
    RoutingConfig.prototype.handleRequest = function (url, request, data) {
        return this.routes[url](request, data);
    };
    return RoutingConfig;
}());
exports.RoutingConfig = RoutingConfig;

},{}],6:[function(require,module,exports){
"use strict";
var sanitizeField = function (value, sanitizeConfig) {
    switch (sanitizeConfig.type) {
        case 'int':
        case 'integer':
            return parseInt(value);
        case 'float':
            return parseFloat(value);
        case 'string':
            return "" + value;
        case "bool":
        case "boolean":
            return typeof value !== 'undefined' &&
                (value === true || (typeof value === 'string' && value.toLowerCase() === 'yes') || value === 1 || value === "1") ? true : false;
    }
};
var sanitize = function (value) {
    return function (target, propertyKey, descriptor) {
        var routeMethod = target[propertyKey];
        descriptor.value = function (data) {
            var sanitized = data;
            for (var key in sanitized) {
                if (typeof value[key] !== 'undefined') {
                    sanitized[key] = sanitizeField(sanitized[key], value[key]);
                }
            }
            return routeMethod.apply(target, [sanitized]);
        };
    };
};
exports.sanitize = sanitize;

},{}],7:[function(require,module,exports){
"use strict";
var config_1 = require("./component/config");
/**
 * Will match a given url to a route, and execute a function/callback defined
 * for that route. Will also parse the URL for different parameters and
 * pass that into the callback if found
 */
var RoutingServiceClass = (function () {
    function RoutingServiceClass() {
    }
    RoutingServiceClass.prototype.onRouteFinished = function () {
    };
    RoutingServiceClass.prototype.routes = function (routes) {
        this.routingConfig = new config_1.RoutingConfig(routes);
        return this;
    };
    RoutingServiceClass.prototype.route = function (url, data) {
        var isRoute = this.routingConfig.isRoute(url);
        if (!isRoute) {
            url = '/';
        }
        if (this.routingConfig.isRoute(url)) {
            var response = this.routingConfig.callRoute(url, data);
            this.activeRoute = url;
            this.onRouteFinished();
            return response;
        }
        return null;
    };
    RoutingServiceClass.prototype.handleRequest = function (url, request, data) {
        var isRoute = this.routingConfig.isRoute(url);
        if (!isRoute) {
            url = 'default:/';
        }
        if (this.routingConfig.isRoute(url)) {
            var response = this.routingConfig.handleRequest(url, request, data);
            this.activeRoute = url;
            this.onRouteFinished();
            return response;
        }
        return null;
    };
    RoutingServiceClass.prototype.doRouting = function () {
        var matchRoute = '';
        for (var rawRoute in this.routingConfig.routes) {
            matchRoute = rawRoute;
            var rawHash = window.location.hash;
            if (rawHash.indexOf('?') >= 0) {
                rawHash = rawHash.substring(0, rawHash.indexOf('?'));
            }
            var res = rawRoute.match(/\{[a-z\_\-\+]+\}/gi);
            var data = {};
            if (res !== null) {
                var routeParts = rawRoute.split('/');
                var hashParts = rawHash.split('/');
                hashParts = hashParts.splice(1, hashParts.length - 1);
                if (hashParts.length !== routeParts.length) {
                    continue;
                }
                var i = 0;
                var bError = false;
                hashParts.forEach(function (part) {
                    if (!routeParts[i].match(/\{[a-z\_\-\+]+\}/gi)) {
                        if (part !== routeParts[i]) {
                            bError = true;
                        }
                    }
                    i++;
                });
                if (bError) {
                    continue;
                }
                //reset the match route for regex
                matchRoute = '';
                routeParts.forEach(function (part, index) {
                    if (index > 0) {
                        matchRoute += '/';
                    }
                    matchRoute += hashParts[index];
                    if (index > 0) {
                        data[part.replace(/[\{\}]/gi, '')] = hashParts[index];
                    }
                });
            }
            matchRoute = matchRoute.replace('+', '\\+');
            var regex = new RegExp('^#\/' + matchRoute + '$', 'gi');
            if (rawHash.match(regex) !== null) {
                if (this.activeRoute === rawRoute && data === this.routeData) {
                    return; //already active
                }
                this.routeData = data;
                this.activeRoute = rawRoute;
                this.route(rawRoute, data);
                return;
            }
        }
        this.route('/', {}); //default route
    };
    return RoutingServiceClass;
}());
exports.RoutingServiceClass = RoutingServiceClass;
var RoutingService = new RoutingServiceClass();
exports.RoutingService = RoutingService;

},{"./component/config":5}],8:[function(require,module,exports){
"use strict";
var store_1 = require("./store");
/**
 * This is used to build a schema from a typescript class without having to
 * redefine all the fields.
 *
 * Usage:
 *
 * class MyAwesomeObject
 * {
 *     public static schema = {}
 *
 *     @Schema.int()
 *     myAwesomeField : number
 *
 *     @Schema.object({
 *         schema: () => {
 *             return SomeOtherObject.schema
 *         }
 *     })
 *     myAwesomeObject : any
 * }
 */
exports.Schema = {
    int: function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, store_1.Store.int.bind(null, config));
    },
    string: function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, store_1.Store.string.bind(null, config));
    },
    double: function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, store_1.Store.double.bind(null, config));
    },
    bool: function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, store_1.Store.bool.bind(null, config));
    },
    float: function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, store_1.Store.float.bind(null, config));
    },
    array: function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, store_1.Store.array.bind(null, config));
    },
    object: function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, store_1.Store.object.bind(null, config));
    },
    datetime: function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, store_1.Store.datetime.bind(null, config));
    },
    callback: function (config) {
        if (config === void 0) { config = null; }
        return setupFunction.bind(null, store_1.Store.callback.bind(null, config));
    },
    uuid: function (config) {
        if (config === void 0) { config = {}; }
        config.initial = function () {
            return uuid();
        };
        return setupFunction.bind(null, store_1.Store.string.bind(null, config));
    }
};
var setupFunction = function (storeCallback, target, propertyKey, descriptor) {
    target.constructor.schema[propertyKey] = storeCallback();
};
var uuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

},{"./store":9}],9:[function(require,module,exports){
///<reference path="../../typings/index.d.ts" />
"use strict";
var extend = require('extend');
/**
 * Store that hooks into actions
 *
 * Store holds all data and is the only class that should modify the data,
 * anything that pulls data from the DataStore cannot modify it and should treat
 * it as immutable
 */
var Store = (function () {
    function Store() {
        /**
         * Holds all of our rows by modelType
         */
        this.rows = {};
        /**
         *  Cache objects by primary key to speed up upsert lookup time
         */
        this.cache = {};
        /**
         * This store's action callbacks
         */
        this.actions = function () {
            //setup any actions
        };
    }
    /**
     * Used to create a store without extending the class
     */
    Store.create = function (params) {
        var store = extend(true, new Store(), params);
        store.actions();
        return store;
    };
    /**
     * Listen on a given event
     */
    Store.prototype.listen = function (event, callback) {
        window.addEventListener(event, callback);
    };
    /**
     * Ignore an event we are listening on
     */
    Store.prototype.ignore = function (event, callback) {
        window.removeEventListener(event, callback);
    };
    /**
     * Emit an event
     */
    Store.prototype.emit = function (event, data) {
        if (data === void 0) { data = {}; }
        var actualEvent = new CustomEvent(event, data);
        window.dispatchEvent(actualEvent);
    };
    /**
     * Insert a row if it doesn't exist, update it otherwise
     */
    Store.prototype.upsertRow = function (modelType, keyValue, newRow, overwrite) {
        if (overwrite === void 0) { overwrite = false; }
        var updated = false;
        if (typeof this.rows[modelType] === 'undefined') {
            this.rows[modelType] = [];
        }
        var rows = this.rows[modelType];
        if (!this.inCache(modelType, keyValue)) {
            this.cache[modelType][keyValue] = newRow;
            this.rows[modelType].push(this.cache[modelType][keyValue]);
        }
        else {
            this.cache[modelType][keyValue] = overwrite ? newRow : this.merge(this.cache[modelType][keyValue], newRow);
        }
    };
    /**
     * Check if we have a model setup in cache
     */
    Store.prototype.inCache = function (modelType, keyValue) {
        if (typeof this.cache[modelType] === 'undefined') {
            this.cache[modelType] = {};
        }
        return typeof this.cache[modelType][keyValue] === 'object';
    };
    /**
     * Remove a row
     */
    Store.prototype.removeRow = function (modelType, keyValue) {
        if (!this.inCache(modelType, keyValue)) {
            return;
        }
        this.cache[modelType][keyValue]._deleted = true;
        this.rows[modelType] = this.rows[modelType].filter(function (row) {
            return !row._deleted;
        });
        delete this.cache[modelType][keyValue];
    };
    /**
     * Pass in an array of keyValues and remove all rows that match
     */
    Store.prototype.removeRows = function (modelType, keyValues) {
        var _this = this;
        keyValues.forEach(function (keyValue) {
            _this.removeRow(modelType, keyValue);
        });
    };
    /**
     * Clear our store of the given modelType
     */
    Store.prototype.clearAll = function (modelType) {
        this.rows[modelType] = [];
    };
    /**
     * Get rows of the given modelType
     */
    Store.prototype.getRows = function (modelType, noSlice) {
        if (noSlice === void 0) { noSlice = true; }
        if (typeof (this.rows[modelType]) !== 'undefined') {
            return noSlice ? this.rows[modelType] : this.rows[modelType].slice(0);
        }
        return [];
    };
    /**
     * Sanitize and valide the given object to the given schema
     */
    Store.prototype.sanitizeAndValidate = function (obj, schema) {
        var model = this.sanitize(obj, schema, false);
        var validation = this.validate(model, schema);
        if (validation === true) {
            return model;
        }
        return validation;
    };
    /**
     * Validate the given object to the given schema, will return an array
     * of errors, or true if valid
     */
    Store.prototype.validate = function (obj, schema) {
        var errors = [];
        for (var field in schema) {
            if (typeof (schema[field].validation) !== 'undefined') {
                for (var validation in schema[field].validation) {
                    if (errors.length > 0) {
                        break;
                    }
                    var value = obj[field];
                    var label = schema[field].label ? schema[field].label : field;
                    switch (validation) {
                        case 'required':
                            if (typeof (value) === 'undefined' || value === null || value === '') {
                                errors.push(label + ' is required');
                            }
                            break;
                        case 'minLength':
                            if (value.length < schema[field].validation[validation]) {
                                errors.push(label + ' must be at least ' + schema[field].validation[validation] + ' characters');
                            }
                            break;
                        case 'maxLength':
                            if (value.length > schema[field].validation[validation]) {
                                errors.push(label + ' must be at under ' + schema[field].validation[validation] + ' characters');
                            }
                            break;
                        default:
                            if (typeof (schema[field].validation[validation]) === 'function') {
                                var results = schema[field].validation[validation](value);
                                if (results !== true) {
                                    errors.concat(results);
                                }
                            }
                            break;
                    }
                }
            }
        }
        return errors.length > 0 ? errors : true;
    };
    /**
     * Sanitize the given object to a schema, also an optional parameter if
     * you are sending the object as JSON, to format datetimes properly
     */
    Store.prototype.sanitize = function (obj, schema, json) {
        if (json === void 0) { json = false; }
        var clean = {};
        var tmp = extend(true, {}, obj);
        for (var field in schema) {
            clean[field] = this.sanitizeField(field, tmp, schema, json);
        }
        return clean;
    };
    /**
     * Merge objects together to a given depth
     */
    Store.prototype.merge = function (obj1, obj2, depth) {
        if (depth === void 0) { depth = 1; }
        if (depth === 3) {
            return obj2;
        }
        for (var p in obj2) {
            try {
                // Property in destination object set; update its value.
                if (obj2[p].constructor === Object) {
                    obj1[p] = this.merge(obj1[p], obj2[p], depth + 1);
                }
                else {
                    obj1[p] = obj2[p];
                }
            }
            catch (e) {
                // Property in destination object not set; create it and set its value.
                obj1[p] = obj2[p];
            }
        }
        return obj1;
    };
    /**
     * Creates a filter sort callback to sort by a given key
     */
    Store.prototype.sortBy = function (key, dir) {
        if (dir === void 0) { dir = 'desc'; }
        return function (a, b) {
            if ((b[key] && !a[key]) || (b[key] && a[key] && b[key] > a[key])) {
                return dir.toLowerCase() === 'desc' ? 1 : -1;
            }
            if ((!b[key] && a[key]) || (b[key] && a[key] && b[key] < a[key])) {
                return dir.toLowerCase() === 'desc' ? -1 : 1;
            }
            if (b[key] && a[key] && b[key] == a[key]) {
                return 0;
            }
            if (b[key] && !a[key]) {
                return 0;
            }
        };
    };
    /**
     * Formats a given number to two decimal places
     */
    Store.prototype.money = function (value) {
        return value.toFixed(2);
    };
    /**
     * Generates a UUID
     */
    Store.prototype.uuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    Store.string = function (params) {
        if (params === void 0) { params = {}; }
        return extend(true, {
            type: 'string'
        }, params);
    };
    Store.int = function (params) {
        if (params === void 0) { params = {}; }
        return extend(true, {
            type: 'int'
        }, params);
    };
    Store.double = function (params) {
        if (params === void 0) { params = {}; }
        return extend(true, {
            type: 'double'
        }, params);
    };
    Store.bool = function (params) {
        if (params === void 0) { params = {}; }
        return extend(true, {
            type: 'bool'
        }, params);
    };
    Store.float = function (params) {
        if (params === void 0) { params = {}; }
        return extend(true, {
            type: 'float'
        }, params);
    };
    Store.array = function (params) {
        if (params === void 0) { params = {}; }
        return extend(true, {
            type: 'array',
            schema: null
        }, params);
    };
    Store.object = function (params) {
        if (params === void 0) { params = {}; }
        return extend(true, {
            type: 'object',
            schema: null
        }, params);
    };
    Store.datetime = function (params) {
        if (params === void 0) { params = {}; }
        return extend(true, {
            type: 'datetime',
            schema: null,
            format: 'YYYY-MM-DD HH:mm:ss'
        }, params);
    };
    Store.callback = function (params) {
        if (params === void 0) { params = {}; }
        return extend(true, {
            type: 'callback',
            schema: null
        }, params);
    };
    /**
     * Sanitizes a field on an object to the given schema
     */
    Store.prototype.sanitizeField = function (field, obj, schema, json) {
        if (schema[field].type === 'function') {
            return schema[field].value; //return function
        }
        if (typeof (obj[field]) === 'undefined') {
            //see if schema has a default
            if (typeof (schema[field]['initial']) !== 'undefined') {
                obj[field] = schema[field]['initial']();
            }
            else {
                obj[field] = null;
            }
        }
        var type = schema[field]['type'];
        if (obj[field] === null && type !== 'obj' && type !== 'object') {
            return null;
        }
        schema[field].field = field;
        switch (type) {
            case 'int':
            case 'integer':
                return this.sanitizeInteger(obj[field], schema[field]);
            case 'float':
            case 'double':
                return this.sanitizeFloat(obj[field], schema[field]);
            case 'string':
            case 'char':
            case 'varchar':
                return this.sanitizeString(obj[field], schema[field]);
            case 'date':
            case 'datetime':
            case 'timestamp':
                return this.sanitizeDateTime(obj[field], schema[field], json);
            case 'bool':
            case 'boolean':
                return this.sanitizeBoolean(obj[field], schema[field]);
            case 'obj':
            case 'object':
                return this.sanitizeObject(obj[field], schema[field], json);
            case 'array':
            case 'collection':
                return this.sanitizeArray(obj[field], schema[field], json);
            default:
                if (schema[field].sanitize !== 'undefined') {
                    return schema[field].sanitize(obj[field], schema[field]);
                }
                break;
        }
    };
    /**
     * Sanitizes a field to an integer
     */
    Store.prototype.sanitizeInteger = function (value, schemaConfig) {
        if (typeof value === 'string') {
            value = value.replace(/[a-zA-Z]+/gi, '');
            if (value.length === 0) {
                return value = '';
            }
        }
        value = parseInt(value);
        if (typeof (schemaConfig.min) !== 'undefined' && value < schemaConfig.min) {
            throw new Error('Provided value cannot be sanitized, value is below minimum integer allowed');
        }
        if (typeof (schemaConfig.max) !== 'undefined' && value > schemaConfig.max) {
            throw new Error('Provided value cannot be sanitized, value is greater than maximum integer allowed');
        }
        if (isNaN(value)) {
            return value = '';
        }
        return value;
    };
    /**
     * Sanitizes a field to a float
     */
    Store.prototype.sanitizeFloat = function (value, schemaConfig) {
        value = parseFloat(value);
        if (typeof (schemaConfig.min) !== 'undefined' && value < schemaConfig.min) {
            throw new Error('Provided value cannot be sanitized, value is below minimum float allowed');
        }
        if (typeof (schemaConfig.max) !== 'undefined' && value > schemaConfig.max) {
            throw new Error('Provided value cannot be sanitized, value is greater than maximum float allowed');
        }
        return value;
    };
    /**
     * Sanitizes a field to a string
     */
    Store.prototype.sanitizeString = function (value, schemaConfig) {
        value = String(value);
        if (typeof (schemaConfig.minLength) !== 'undefined' && value.length < schemaConfig.minLength) {
            throw new Error('Provided value cannot be sanitized, string length is below minimum allowed');
        }
        if (typeof (schemaConfig.maxLength) !== 'undefined' && value.length > schemaConfig.maxLength) {
            //truncate and do a warning
            console.warn('Value was truncated during sanitation');
            value = value.substr(0, schemaConfig.maxLength);
        }
        return value;
    };
    /**
     * Sanitizes a field to a moment object
     */
    Store.prototype.sanitizeDateTime = function (value, schemaConfig, json) {
        if (typeof schemaConfig.utc === 'undefined' || schemaConfig.utc) {
            var momentDate = moment.utc(value, schemaConfig.format);
        }
        else {
            var momentDate = moment(value, schemaConfig.format);
        }
        if (momentDate.isValid()) {
            if (json) {
                return momentDate.utc().format('YYYY-MM-DD hh:mm:ss');
            }
            return momentDate;
        }
        throw new Error("Provided value (" + value + ") cannot be sanitized for field (" + schemaConfig.field + "), is not a valid date");
    };
    /**
     * Sanitizes a field to boolean
     */
    Store.prototype.sanitizeBoolean = function (value, schemaConfig) {
        if (value === false || value === true) {
            return value;
        }
        if (typeof (value) == 'string') {
            if (value.toLowerCase().trim() === 'false') {
                return false;
            }
            if (value.toLowerCase().trim() === 'true') {
                return true;
            }
        }
        if (parseInt(value) === 0) {
            return false;
        }
        if (parseInt(value) === 1) {
            return true;
        }
        throw new Error('Provided value cannot be santized, is not a valid boolean');
    };
    /**
     * Sanitizes an object
     */
    Store.prototype.sanitizeObject = function (value, schemaConfig, json) {
        if (typeof (schemaConfig.schema) === 'undefined') {
            throw new Error('Provided value cannot be santized, no reference schema provided for field type of object');
        }
        if (schemaConfig.schema === null) {
            return value;
        }
        if (value === null) {
            return null;
        }
        return this.sanitize(value, schemaConfig.schema(), json);
    };
    /**
     * Sanitizes an array of objects
     */
    Store.prototype.sanitizeArray = function (value, schemaConfig, json) {
        var _this = this;
        if (typeof (schemaConfig.schema) === 'undefined' || schemaConfig.schema === null || schemaConfig.schema === false) {
            return value;
        }
        if (typeof (value.length) === 'undefined') {
            return []; //empty array
        }
        return value.map(function (v) {
            return _this.sanitize(v, schemaConfig.schema(), json);
        });
    };
    return Store;
}());
exports.Store = Store;

},{"extend":11}],10:[function(require,module,exports){

},{}],11:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],12:[function(require,module,exports){
/*!
  * Reqwest! A general purpose XHR connection manager
  * license MIT (c) Dustin Diaz 2015
  * https://github.com/ded/reqwest
  */

!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
}('reqwest', this, function () {

  var context = this

  if ('window' in context) {
    var doc = document
      , byTag = 'getElementsByTagName'
      , head = doc[byTag]('head')[0]
  } else {
    var XHR2
    try {
      XHR2 = require('xhr2')
    } catch (ex) {
      throw new Error('Peer dependency `xhr2` required! Please npm install xhr2')
    }
  }


  var httpsRe = /^http/
    , protocolRe = /(^\w+):\/\//
    , twoHundo = /^(20\d|1223)$/ //http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
    , readyState = 'readyState'
    , contentType = 'Content-Type'
    , requestedWith = 'X-Requested-With'
    , uniqid = 0
    , callbackPrefix = 'reqwest_' + (+new Date())
    , lastValue // data stored by the most recent JSONP callback
    , xmlHttpRequest = 'XMLHttpRequest'
    , xDomainRequest = 'XDomainRequest'
    , noop = function () {}

    , isArray = typeof Array.isArray == 'function'
        ? Array.isArray
        : function (a) {
            return a instanceof Array
          }

    , defaultHeaders = {
          'contentType': 'application/x-www-form-urlencoded'
        , 'requestedWith': xmlHttpRequest
        , 'accept': {
              '*':  'text/javascript, text/html, application/xml, text/xml, */*'
            , 'xml':  'application/xml, text/xml'
            , 'html': 'text/html'
            , 'text': 'text/plain'
            , 'json': 'application/json, text/javascript'
            , 'js':   'application/javascript, text/javascript'
          }
      }

    , xhr = function(o) {
        // is it x-domain
        if (o['crossOrigin'] === true) {
          var xhr = context[xmlHttpRequest] ? new XMLHttpRequest() : null
          if (xhr && 'withCredentials' in xhr) {
            return xhr
          } else if (context[xDomainRequest]) {
            return new XDomainRequest()
          } else {
            throw new Error('Browser does not support cross-origin requests')
          }
        } else if (context[xmlHttpRequest]) {
          return new XMLHttpRequest()
        } else if (XHR2) {
          return new XHR2()
        } else {
          return new ActiveXObject('Microsoft.XMLHTTP')
        }
      }
    , globalSetupOptions = {
        dataFilter: function (data) {
          return data
        }
      }

  function succeed(r) {
    var protocol = protocolRe.exec(r.url)
    protocol = (protocol && protocol[1]) || context.location.protocol
    return httpsRe.test(protocol) ? twoHundo.test(r.request.status) : !!r.request.response
  }

  function handleReadyState(r, success, error) {
    return function () {
      // use _aborted to mitigate against IE err c00c023f
      // (can't read props on aborted request objects)
      if (r._aborted) return error(r.request)
      if (r._timedOut) return error(r.request, 'Request is aborted: timeout')
      if (r.request && r.request[readyState] == 4) {
        r.request.onreadystatechange = noop
        if (succeed(r)) success(r.request)
        else
          error(r.request)
      }
    }
  }

  function setHeaders(http, o) {
    var headers = o['headers'] || {}
      , h

    headers['Accept'] = headers['Accept']
      || defaultHeaders['accept'][o['type']]
      || defaultHeaders['accept']['*']

    var isAFormData = typeof FormData !== 'undefined' && (o['data'] instanceof FormData);
    // breaks cross-origin requests with legacy browsers
    if (!o['crossOrigin'] && !headers[requestedWith]) headers[requestedWith] = defaultHeaders['requestedWith']
    if (!headers[contentType] && !isAFormData) headers[contentType] = o['contentType'] || defaultHeaders['contentType']
    for (h in headers)
      headers.hasOwnProperty(h) && 'setRequestHeader' in http && http.setRequestHeader(h, headers[h])
  }

  function setCredentials(http, o) {
    if (typeof o['withCredentials'] !== 'undefined' && typeof http.withCredentials !== 'undefined') {
      http.withCredentials = !!o['withCredentials']
    }
  }

  function generalCallback(data) {
    lastValue = data
  }

  function urlappend (url, s) {
    return url + (/\?/.test(url) ? '&' : '?') + s
  }

  function handleJsonp(o, fn, err, url) {
    var reqId = uniqid++
      , cbkey = o['jsonpCallback'] || 'callback' // the 'callback' key
      , cbval = o['jsonpCallbackName'] || reqwest.getcallbackPrefix(reqId)
      , cbreg = new RegExp('((^|\\?|&)' + cbkey + ')=([^&]+)')
      , match = url.match(cbreg)
      , script = doc.createElement('script')
      , loaded = 0
      , isIE10 = navigator.userAgent.indexOf('MSIE 10.0') !== -1

    if (match) {
      if (match[3] === '?') {
        url = url.replace(cbreg, '$1=' + cbval) // wildcard callback func name
      } else {
        cbval = match[3] // provided callback func name
      }
    } else {
      url = urlappend(url, cbkey + '=' + cbval) // no callback details, add 'em
    }

    context[cbval] = generalCallback

    script.type = 'text/javascript'
    script.src = url
    script.async = true
    if (typeof script.onreadystatechange !== 'undefined' && !isIE10) {
      // need this for IE due to out-of-order onreadystatechange(), binding script
      // execution to an event listener gives us control over when the script
      // is executed. See http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
      script.htmlFor = script.id = '_reqwest_' + reqId
    }

    script.onload = script.onreadystatechange = function () {
      if ((script[readyState] && script[readyState] !== 'complete' && script[readyState] !== 'loaded') || loaded) {
        return false
      }
      script.onload = script.onreadystatechange = null
      script.onclick && script.onclick()
      // Call the user callback with the last value stored and clean up values and scripts.
      fn(lastValue)
      lastValue = undefined
      head.removeChild(script)
      loaded = 1
    }

    // Add the script to the DOM head
    head.appendChild(script)

    // Enable JSONP timeout
    return {
      abort: function () {
        script.onload = script.onreadystatechange = null
        err({}, 'Request is aborted: timeout', {})
        lastValue = undefined
        head.removeChild(script)
        loaded = 1
      }
    }
  }

  function getRequest(fn, err) {
    var o = this.o
      , method = (o['method'] || 'GET').toUpperCase()
      , url = typeof o === 'string' ? o : o['url']
      // convert non-string objects to query-string form unless o['processData'] is false
      , data = (o['processData'] !== false && o['data'] && typeof o['data'] !== 'string')
        ? reqwest.toQueryString(o['data'])
        : (o['data'] || null)
      , http
      , sendWait = false

    // if we're working on a GET request and we have data then we should append
    // query string to end of URL and not post data
    if ((o['type'] == 'jsonp' || method == 'GET') && data) {
      url = urlappend(url, data)
      data = null
    }

    if (o['type'] == 'jsonp') return handleJsonp(o, fn, err, url)

    // get the xhr from the factory if passed
    // if the factory returns null, fall-back to ours
    http = (o.xhr && o.xhr(o)) || xhr(o)

    http.open(method, url, o['async'] === false ? false : true)
    setHeaders(http, o)
    setCredentials(http, o)
    if (context[xDomainRequest] && http instanceof context[xDomainRequest]) {
        http.onload = fn
        http.onerror = err
        // NOTE: see
        // http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/30ef3add-767c-4436-b8a9-f1ca19b4812e
        http.onprogress = function() {}
        sendWait = true
    } else {
      http.onreadystatechange = handleReadyState(this, fn, err)
    }
    o['before'] && o['before'](http)
    if (sendWait) {
      setTimeout(function () {
        http.send(data)
      }, 200)
    } else {
      http.send(data)
    }
    return http
  }

  function Reqwest(o, fn) {
    this.o = o
    this.fn = fn

    init.apply(this, arguments)
  }

  function setType(header) {
    // json, javascript, text/plain, text/html, xml
    if (header === null) return undefined; //In case of no content-type.
    if (header.match('json')) return 'json'
    if (header.match('javascript')) return 'js'
    if (header.match('text')) return 'html'
    if (header.match('xml')) return 'xml'
  }

  function init(o, fn) {

    this.url = typeof o == 'string' ? o : o['url']
    this.timeout = null

    // whether request has been fulfilled for purpose
    // of tracking the Promises
    this._fulfilled = false
    // success handlers
    this._successHandler = function(){}
    this._fulfillmentHandlers = []
    // error handlers
    this._errorHandlers = []
    // complete (both success and fail) handlers
    this._completeHandlers = []
    this._erred = false
    this._responseArgs = {}

    var self = this

    fn = fn || function () {}

    if (o['timeout']) {
      this.timeout = setTimeout(function () {
        timedOut()
      }, o['timeout'])
    }

    if (o['success']) {
      this._successHandler = function () {
        o['success'].apply(o, arguments)
      }
    }

    if (o['error']) {
      this._errorHandlers.push(function () {
        o['error'].apply(o, arguments)
      })
    }

    if (o['complete']) {
      this._completeHandlers.push(function () {
        o['complete'].apply(o, arguments)
      })
    }

    function complete (resp) {
      o['timeout'] && clearTimeout(self.timeout)
      self.timeout = null
      while (self._completeHandlers.length > 0) {
        self._completeHandlers.shift()(resp)
      }
    }

    function success (resp) {
      var type = o['type'] || resp && setType(resp.getResponseHeader('Content-Type')) // resp can be undefined in IE
      resp = (type !== 'jsonp') ? self.request : resp
      // use global data filter on response text
      var filteredResponse = globalSetupOptions.dataFilter(resp.responseText, type)
        , r = filteredResponse
      try {
        resp.responseText = r
      } catch (e) {
        // can't assign this in IE<=8, just ignore
      }
      if (r) {
        switch (type) {
        case 'json':
          try {
            resp = context.JSON ? context.JSON.parse(r) : eval('(' + r + ')')
          } catch (err) {
            return error(resp, 'Could not parse JSON in response', err)
          }
          break
        case 'js':
          resp = eval(r)
          break
        case 'html':
          resp = r
          break
        case 'xml':
          resp = resp.responseXML
              && resp.responseXML.parseError // IE trololo
              && resp.responseXML.parseError.errorCode
              && resp.responseXML.parseError.reason
            ? null
            : resp.responseXML
          break
        }
      }

      self._responseArgs.resp = resp
      self._fulfilled = true
      fn(resp)
      self._successHandler(resp)
      while (self._fulfillmentHandlers.length > 0) {
        resp = self._fulfillmentHandlers.shift()(resp)
      }

      complete(resp)
    }

    function timedOut() {
      self._timedOut = true
      self.request.abort()
    }

    function error(resp, msg, t) {
      resp = self.request
      self._responseArgs.resp = resp
      self._responseArgs.msg = msg
      self._responseArgs.t = t
      self._erred = true
      while (self._errorHandlers.length > 0) {
        self._errorHandlers.shift()(resp, msg, t)
      }
      complete(resp)
    }

    this.request = getRequest.call(this, success, error)
  }

  Reqwest.prototype = {
    abort: function () {
      this._aborted = true
      this.request.abort()
    }

  , retry: function () {
      init.call(this, this.o, this.fn)
    }

    /**
     * Small deviation from the Promises A CommonJs specification
     * http://wiki.commonjs.org/wiki/Promises/A
     */

    /**
     * `then` will execute upon successful requests
     */
  , then: function (success, fail) {
      success = success || function () {}
      fail = fail || function () {}
      if (this._fulfilled) {
        this._responseArgs.resp = success(this._responseArgs.resp)
      } else if (this._erred) {
        fail(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t)
      } else {
        this._fulfillmentHandlers.push(success)
        this._errorHandlers.push(fail)
      }
      return this
    }

    /**
     * `always` will execute whether the request succeeds or fails
     */
  , always: function (fn) {
      if (this._fulfilled || this._erred) {
        fn(this._responseArgs.resp)
      } else {
        this._completeHandlers.push(fn)
      }
      return this
    }

    /**
     * `fail` will execute when the request fails
     */
  , fail: function (fn) {
      if (this._erred) {
        fn(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t)
      } else {
        this._errorHandlers.push(fn)
      }
      return this
    }
  , 'catch': function (fn) {
      return this.fail(fn)
    }
  }

  function reqwest(o, fn) {
    return new Reqwest(o, fn)
  }

  // normalize newline variants according to spec -> CRLF
  function normalize(s) {
    return s ? s.replace(/\r?\n/g, '\r\n') : ''
  }

  function serial(el, cb) {
    var n = el.name
      , t = el.tagName.toLowerCase()
      , optCb = function (o) {
          // IE gives value="" even where there is no value attribute
          // 'specified' ref: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-862529273
          if (o && !o['disabled'])
            cb(n, normalize(o['attributes']['value'] && o['attributes']['value']['specified'] ? o['value'] : o['text']))
        }
      , ch, ra, val, i

    // don't serialize elements that are disabled or without a name
    if (el.disabled || !n) return

    switch (t) {
    case 'input':
      if (!/reset|button|image|file/i.test(el.type)) {
        ch = /checkbox/i.test(el.type)
        ra = /radio/i.test(el.type)
        val = el.value
        // WebKit gives us "" instead of "on" if a checkbox has no value, so correct it here
        ;(!(ch || ra) || el.checked) && cb(n, normalize(ch && val === '' ? 'on' : val))
      }
      break
    case 'textarea':
      cb(n, normalize(el.value))
      break
    case 'select':
      if (el.type.toLowerCase() === 'select-one') {
        optCb(el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null)
      } else {
        for (i = 0; el.length && i < el.length; i++) {
          el.options[i].selected && optCb(el.options[i])
        }
      }
      break
    }
  }

  // collect up all form elements found from the passed argument elements all
  // the way down to child elements; pass a '<form>' or form fields.
  // called with 'this'=callback to use for serial() on each element
  function eachFormElement() {
    var cb = this
      , e, i
      , serializeSubtags = function (e, tags) {
          var i, j, fa
          for (i = 0; i < tags.length; i++) {
            fa = e[byTag](tags[i])
            for (j = 0; j < fa.length; j++) serial(fa[j], cb)
          }
        }

    for (i = 0; i < arguments.length; i++) {
      e = arguments[i]
      if (/input|select|textarea/i.test(e.tagName)) serial(e, cb)
      serializeSubtags(e, [ 'input', 'select', 'textarea' ])
    }
  }

  // standard query string style serialization
  function serializeQueryString() {
    return reqwest.toQueryString(reqwest.serializeArray.apply(null, arguments))
  }

  // { 'name': 'value', ... } style serialization
  function serializeHash() {
    var hash = {}
    eachFormElement.apply(function (name, value) {
      if (name in hash) {
        hash[name] && !isArray(hash[name]) && (hash[name] = [hash[name]])
        hash[name].push(value)
      } else hash[name] = value
    }, arguments)
    return hash
  }

  // [ { name: 'name', value: 'value' }, ... ] style serialization
  reqwest.serializeArray = function () {
    var arr = []
    eachFormElement.apply(function (name, value) {
      arr.push({name: name, value: value})
    }, arguments)
    return arr
  }

  reqwest.serialize = function () {
    if (arguments.length === 0) return ''
    var opt, fn
      , args = Array.prototype.slice.call(arguments, 0)

    opt = args.pop()
    opt && opt.nodeType && args.push(opt) && (opt = null)
    opt && (opt = opt.type)

    if (opt == 'map') fn = serializeHash
    else if (opt == 'array') fn = reqwest.serializeArray
    else fn = serializeQueryString

    return fn.apply(null, args)
  }

  reqwest.toQueryString = function (o, trad) {
    var prefix, i
      , traditional = trad || false
      , s = []
      , enc = encodeURIComponent
      , add = function (key, value) {
          // If value is a function, invoke it and return its value
          value = ('function' === typeof value) ? value() : (value == null ? '' : value)
          s[s.length] = enc(key) + '=' + enc(value)
        }
    // If an array was passed in, assume that it is an array of form elements.
    if (isArray(o)) {
      for (i = 0; o && i < o.length; i++) add(o[i]['name'], o[i]['value'])
    } else {
      // If traditional, encode the "old" way (the way 1.3.2 or older
      // did it), otherwise encode params recursively.
      for (prefix in o) {
        if (o.hasOwnProperty(prefix)) buildParams(prefix, o[prefix], traditional, add)
      }
    }

    // spaces should be + according to spec
    return s.join('&').replace(/%20/g, '+')
  }

  function buildParams(prefix, obj, traditional, add) {
    var name, i, v
      , rbracket = /\[\]$/

    if (isArray(obj)) {
      // Serialize array item.
      for (i = 0; obj && i < obj.length; i++) {
        v = obj[i]
        if (traditional || rbracket.test(prefix)) {
          // Treat each array item as a scalar.
          add(prefix, v)
        } else {
          buildParams(prefix + '[' + (typeof v === 'object' ? i : '') + ']', v, traditional, add)
        }
      }
    } else if (obj && obj.toString() === '[object Object]') {
      // Serialize object item.
      for (name in obj) {
        buildParams(prefix + '[' + name + ']', obj[name], traditional, add)
      }

    } else {
      // Serialize scalar item.
      add(prefix, obj)
    }
  }

  reqwest.getcallbackPrefix = function () {
    return callbackPrefix
  }

  // jQuery and Zepto compatibility, differences can be remapped here so you can call
  // .ajax.compat(options, callback)
  reqwest.compat = function (o, fn) {
    if (o) {
      o['type'] && (o['method'] = o['type']) && delete o['type']
      o['dataType'] && (o['type'] = o['dataType'])
      o['jsonpCallback'] && (o['jsonpCallbackName'] = o['jsonpCallback']) && delete o['jsonpCallback']
      o['jsonp'] && (o['jsonpCallback'] = o['jsonp'])
    }
    return new Reqwest(o, fn)
  }

  reqwest.ajaxSetup = function (options) {
    options = options || {}
    for (var k in options) {
      globalSetupOptions[k] = options[k]
    }
  }

  return reqwest
});

},{"xhr2":10}]},{},[4])(4)
});